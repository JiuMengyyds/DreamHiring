"""DreamHiring 招聘数据离线清洗与统计。

输入为规范化招聘 CSV，输出 analysis_stat / analysis_hot_skill 的 MySQL SQL。
默认只生成 SQL，传入 --execute 时才通过本机 mysql 客户端写入数据库。
"""

from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
from dataclasses import asdict, dataclass
from datetime import datetime
from pathlib import Path
from typing import Iterable
from zoneinfo import ZoneInfo

import numpy as np
import pandas as pd

from adapters.tianchi_163746 import LoadedDataset, load_tianchi_163746


SALARY_BINS = (
    ("8K以下", 0, 8),
    ("8-12K", 8, 12),
    ("12-18K", 12, 18),
    ("18-25K", 18, 25),
    ("25-35K", 25, 35),
    ("35K以上", 35, float("inf")),
)

EDUCATION_MAP = {
    "中专及以下": "中专及以下",
    "大专": "COLLEGE",
    "专科": "大专",
    "本科": "BACHELOR",
    "硕士": "MASTER",
    "博士": "DOCTOR",
    "不限": "UNLIMITED",
    "COLLEGE": "大专",
    "BACHELOR": "本科",
    "MASTER": "硕士",
    "DOCTOR": "博士",
    "UNLIMITED": "不限",
}

EXPERIENCE_MAP = {
    "应届": "FRESH",
    "应届生": "FRESH",
    "应届/无经验": "应届/无经验",
    "1年以下": "FRESH",
    "1-3年": "ONE_TO_THREE",
    "3-5年": "THREE_TO_FIVE",
    "5-10年": "FIVE_TO_TEN",
    "10年以上": "TEN_PLUS",
    "不限": "UNLIMITED",
    "FRESH": "应届/无经验",
    "ONE_TO_THREE": "1-3年",
    "THREE_TO_FIVE": "3-5年",
    "FIVE_TO_TEN": "5-10年",
    "TEN_PLUS": "10年以上",
    "UNLIMITED": "不限",
}

EDUCATION_DISPLAY_MAP = {
    "COLLEGE": "大专",
    "BACHELOR": "本科",
    "MASTER": "硕士",
    "DOCTOR": "博士",
    "UNLIMITED": "不限",
}

EXPERIENCE_DISPLAY_MAP = {
    "FRESH": "应届/无经验",
    "ONE_TO_THREE": "1-3年",
    "THREE_TO_FIVE": "3-5年",
    "FIVE_TO_TEN": "5-10年",
    "TEN_PLUS": "10年以上",
    "UNLIMITED": "不限",
}


@dataclass(frozen=True)
class AnalysisSummary:
    """一次分析的可审计摘要。"""

    input_rows: int
    valid_rows: int
    duplicate_rows: int
    invalid_city_rows: int
    source_dataset: str
    stat_date: str


def parse_salary(value: object) -> tuple[float, float] | tuple[None, None]:
    """把常见月薪、年薪和日薪文本统一为月薪 K。"""
    if value is None or pd.isna(value):
        return None, None
    text = str(value).strip().lower().replace(" ", "")
    if not text or "面议" in text:
        return None, None
    numbers = [float(item) for item in re.findall(r"\d+(?:\.\d+)?", text)]
    if not numbers:
        return None, None
    if "万/年" in text or "万元/年" in text or "年薪" in text:
        multiplier = 10.0 / 12.0
    elif "元/天" in text or "元天" in text:
        multiplier = 21.75 / 1000.0
    elif "元/年" in text:
        multiplier = 1.0 / 12_000.0
    elif "元/月" in text:
        multiplier = 0.001
    elif "万" in text:
        multiplier = 10.0
    elif "元" in text and "k" not in text and "千" not in text:
        multiplier = 0.001
    else:
        multiplier = 1.0
    low = numbers[0] * multiplier
    high = numbers[1] * multiplier if len(numbers) > 1 else low
    if low > high:
        low, high = high, low
    if low <= 0 or high > 1_000:
        return None, None
    return round(low, 2), round(high, 2)


def normalize_city(value: object) -> str | None:
    if value is None or pd.isna(value):
        return None
    city = str(value).strip()
    city = re.sub(r"(市|地区)$", "", city)
    return city or None


def normalize_label(value: object, mapping: dict[str, str], fallback: str) -> str:
    if value is None or pd.isna(value):
        return fallback
    text = str(value).strip()
    mapped = mapping.get(text, text or fallback)
    return mapped if mapped else fallback


def split_skills(value: object) -> list[str]:
    if isinstance(value, (list, tuple, set)):
        return [str(item).strip() for item in value if str(item).strip()]
    if value is None or pd.isna(value):
        return []
    return [
        item.strip()
        for item in re.split(r"[,，;；|/\r\n]+", str(value))
        if item and item.strip()
    ]


def _distribution(df: pd.DataFrame, column: str, limit: int | None = None) -> list[tuple[str, float]]:
    counts = df[column].fillna("未知").astype(str).value_counts()
    if limit is not None:
        counts = counts.head(limit)
    total = int(counts.sum())
    if total == 0:
        return []
    return [
        (str(name), round(count * 100 / total, 2))
        for name, count in counts.items()
    ]


def _salary_distribution(df: pd.DataFrame) -> list[tuple[str, float]]:
    midpoints = df["salary_mid"].dropna()
    if midpoints.empty:
        return []
    labels = []
    for value in midpoints:
        for label, low, high in SALARY_BINS:
            if low <= value < high:
                labels.append(label)
                break
    if not labels:
        return []
    counts = pd.Series(labels).value_counts()
    return [
        (label, round(count * 100 / len(labels), 2))
        for label, count in counts.items()
    ]


def _load_input(input_path: Path, input_format: str) -> LoadedDataset:
    if input_format == "tianchi-163746":
        return load_tianchi_163746(input_path)
    if input_format != "standard":
        raise ValueError(f"不支持的输入格式: {input_format}")
    raw = pd.read_csv(input_path)
    return LoadedDataset(
        frame=raw,
        input_rows=len(raw),
        exact_duplicate_rows=0,
        business_duplicate_rows=0,
    )


def analyze(
    input_path: Path,
    source_dataset: str | None = None,
    input_format: str = "standard",
) -> tuple[pd.DataFrame, list[tuple[str, int]], AnalysisSummary]:
    loaded = _load_input(input_path, input_format)
    raw = loaded.frame
    input_rows = loaded.input_rows
    required = {"title", "city"}
    missing = required.difference(raw.columns)
    if missing:
        raise ValueError(f"CSV 缺少必要字段: {', '.join(sorted(missing))}")

    df = raw.copy()
    if "industry" not in df:
        df["industry"] = "未知"
    if "education" not in df:
        df["education"] = "不限"
    if "experience" not in df:
        df["experience"] = "不限"
    if "salary" not in df:
        df["salary"] = None
    if "skills" not in df:
        df["skills"] = ""

    df["city"] = df["city"].map(normalize_city)
    df["title"] = df["title"].map(lambda value: str(value).strip() if not pd.isna(value) else "")
    df = df[df["title"] != ""]
    invalid_city_rows = int(df["city"].isna().sum())
    df = df.dropna(subset=["city"])

    salary_pairs = df["salary"].map(parse_salary)
    df["salary_min"] = [item[0] for item in salary_pairs]
    df["salary_max"] = [item[1] for item in salary_pairs]
    df["salary_mid"] = df[["salary_min", "salary_max"]].mean(axis=1, skipna=True)
    has_education = df["education"].notna() & (df["education"].astype(str).str.strip() != "")
    has_experience = df["experience"].notna() & (df["experience"].astype(str).str.strip() != "")

    if input_format == "tianchi-163746":
        df = df.dropna(subset=["salary_mid"])
        df = df[has_education.reindex(df.index, fill_value=False)]
        df = df[has_experience.reindex(df.index, fill_value=False)]
        duplicate_rows = loaded.duplicate_rows
    else:
        before_dedup = len(df)
        subset = [column for column in ("title", "company", "city", "salary") if column in df.columns]
        df = df.drop_duplicates(subset=subset or None)
        duplicate_rows = loaded.duplicate_rows + before_dedup - len(df)

    df["education_label"] = df["education"].map(
        lambda value: EDUCATION_DISPLAY_MAP.get(
            normalize_label(value, EDUCATION_MAP, "UNLIMITED"),
            normalize_label(value, EDUCATION_MAP, "UNLIMITED"),
        )
    )
    df["experience_label"] = df["experience"].map(
        lambda value: EXPERIENCE_DISPLAY_MAP.get(
            normalize_label(value, EXPERIENCE_MAP, "UNLIMITED"),
            normalize_label(value, EXPERIENCE_MAP, "UNLIMITED"),
        )
    )
    df["industry"] = df["industry"].map(
        lambda value: "未知" if pd.isna(value) or not str(value).strip() else str(value).strip()
    )

    distributions = {
        "salary": _salary_distribution(df),
        "city": _distribution(df, "city", limit=20),
        "education": _distribution(df, "education_label"),
        "experience": _distribution(df, "experience_label"),
        "industry": _distribution(df, "industry", limit=20),
    }
    stat_rows: list[dict[str, object]] = []
    dataset_name = source_dataset or input_path.stem
    analysis_date = datetime.now(ZoneInfo("Asia/Shanghai")).date()
    stat_rows.append(
        {
            "dimension": "overview",
            "dim_value": "sample_count",
            "metric": "count",
            "stat_value": len(df),
            "source_dataset": dataset_name,
            "stat_date": analysis_date,
        }
    )
    if not df["salary_mid"].dropna().empty:
        stat_rows.append(
            {
                "dimension": "overview",
                "dim_value": "average_salary",
                "metric": "average_k",
                "stat_value": round(float(df["salary_mid"].mean()), 2),
                "source_dataset": dataset_name,
                "stat_date": analysis_date,
            }
        )
    for dimension, values in distributions.items():
        for value, percent in values:
            stat_rows.append(
                {
                    "dimension": dimension,
                    "dim_value": value,
                    "metric": "percent",
                    "stat_value": percent,
                    "source_dataset": dataset_name,
                    "stat_date": analysis_date,
                }
            )

    skill_counts: dict[str, int] = {}
    for skills in df["skills"].map(split_skills):
        for skill in set(skills):
            skill_counts[skill] = skill_counts.get(skill, 0) + 1
    hot_skills = sorted(skill_counts.items(), key=lambda item: (-item[1], item[0]))[:100]
    summary = AnalysisSummary(
        input_rows=input_rows,
        valid_rows=len(df),
        duplicate_rows=duplicate_rows,
        invalid_city_rows=invalid_city_rows,
        source_dataset=dataset_name,
        stat_date=analysis_date.isoformat(),
    )
    return pd.DataFrame(stat_rows), hot_skills, summary


def _sql(value: object) -> str:
    if value is None or (isinstance(value, float) and np.isnan(value)):
        return "NULL"
    if isinstance(value, (int, float, np.integer, np.floating)):
        return str(value)
    return "'" + str(value).replace("\\", "\\\\").replace("'", "''") + "'"


def build_sql(
    stats: pd.DataFrame,
    hot_skills: Iterable[tuple[str, int]],
    summary: AnalysisSummary,
) -> str:
    lines = [
        "START TRANSACTION;",
        (
            "DELETE FROM analysis_stat WHERE source_dataset = "
            f"{_sql(summary.source_dataset)} AND stat_date = {_sql(summary.stat_date)};"
        ),
        (
            "DELETE FROM analysis_hot_skill WHERE source_dataset = "
            f"{_sql(summary.source_dataset)} AND stat_date = {_sql(summary.stat_date)};"
        ),
    ]
    for row in stats.to_dict(orient="records"):
        lines.append(
            "INSERT INTO analysis_stat "
            "(dimension, dim_value, metric, stat_value, source_dataset, stat_date) VALUES ("
            + ", ".join(
                _sql(row[column])
                for column in ("dimension", "dim_value", "metric", "stat_value", "source_dataset", "stat_date")
            )
            + ");"
        )
    for skill, count in hot_skills:
        lines.append(
            "INSERT INTO analysis_hot_skill "
            "(skill, freq_count, source_dataset, stat_date) VALUES ("
            f"{_sql(skill)}, {_sql(count)}, {_sql(summary.source_dataset)}, {_sql(summary.stat_date)});"
        )
    lines.extend(["COMMIT;", ""])
    return "\n".join(lines)


def execute_sql(sql: str, database: str, mysql_binary: str) -> None:
    username = os.environ.get("DREAMHIRING_DB_USERNAME")
    password = os.environ.get("DREAMHIRING_DB_PASSWORD")
    host = os.environ.get("DREAMHIRING_DB_HOST", "127.0.0.1")
    port = os.environ.get("DREAMHIRING_DB_PORT", "3306")
    if not username or password is None:
        raise RuntimeError("执行写入前必须设置 DREAMHIRING_DB_USERNAME 和 DREAMHIRING_DB_PASSWORD")
    environment = os.environ.copy()
    environment["MYSQL_PWD"] = password
    subprocess.run(
        [
            mysql_binary,
            f"--host={host}",
            f"--port={port}",
            f"--user={username}",
            f"--database={database}",
        ],
        input=sql,
        text=True,
        encoding="utf-8",
        check=True,
        env=environment,
    )


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="DreamHiring 招聘数据离线分析")
    parser.add_argument("--input", required=True, type=Path, help="招聘数据 CSV")
    parser.add_argument(
        "--format",
        choices=("standard", "tianchi-163746"),
        default="standard",
        help="CSV 结构；天池 163746 使用 tianchi-163746",
    )
    parser.add_argument("--output", type=Path, default=Path("analysis-output.sql"), help="SQL 输出路径")
    parser.add_argument("--source-dataset", help="数据集名称，默认使用文件名")
    parser.add_argument("--execute", action="store_true", help="生成后写入 MySQL")
    parser.add_argument("--database", default="dream_hiring", help="目标数据库")
    parser.add_argument("--mysql", default="mysql", help="mysql 客户端路径")
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    args = parse_args(argv)
    stats, hot_skills, summary = analyze(args.input, args.source_dataset, args.format)
    sql = build_sql(stats, hot_skills, summary)
    args.output.write_text(sql, encoding="utf-8")
    print(json.dumps(asdict(summary), ensure_ascii=False, indent=2))
    if args.execute:
        execute_sql(sql, args.database, args.mysql)
        print(f"已写入 MySQL 数据库: {args.database}")
    else:
        print(f"SQL 已生成: {args.output}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
