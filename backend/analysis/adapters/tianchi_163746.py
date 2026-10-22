"""阿里云天池招聘数据分析数据集（163746）适配器。

该文件没有表头并使用 GB18030 编码，城市、经验、学历、行业和职位描述等
字段以 Python 列表字符串的形式存放在单独的 CSV 列中。
"""

from __future__ import annotations

import ast
import re
from dataclasses import dataclass
from pathlib import Path

import pandas as pd


DATASET_ID = "163746"
DATASET_NAME = "阿里云天池-招聘数据分析数据集163746"
DATASET_URL = f"https://tianchi.aliyun.com/dataset/{DATASET_ID}"

_CITY_SEPARATOR = re.compile(r"\s*[-－—]\s*")
_WHITESPACE = re.compile(r"[\s\u00a0\u3000]+")
_EXPERIENCE_RANGE = re.compile(r"(\d+)\s*(?:-\s*(\d+))?\s*年")

_SKILL_PATTERNS: tuple[tuple[str, tuple[str, ...]], ...] = (
    ("Python", (r"(?<![A-Za-z])Python(?![A-Za-z])",)),
    ("SQL", (r"(?<![A-Za-z])SQL(?![A-Za-z])",)),
    ("Excel", (r"(?<![A-Za-z])Excel(?![A-Za-z])",)),
    ("Tableau", (r"(?<![A-Za-z])Tableau(?![A-Za-z])",)),
    ("Power BI", (r"(?<![A-Za-z])Power\s*BI(?![A-Za-z])",)),
    ("FineBI", (r"(?<![A-Za-z])FineBI(?![A-Za-z])",)),
    ("SPSS", (r"(?<![A-Za-z])SPSS(?![A-Za-z])",)),
    ("SAS", (r"(?<![A-Za-z])SAS(?![A-Za-z])",)),
    ("R语言", (r"(?<![A-Za-z])R(?![A-Za-z])", "R语言")),
    ("MATLAB", (r"(?<![A-Za-z])MATLAB(?![A-Za-z])",)),
    ("Java", (r"(?<![A-Za-z])Java(?![A-Za-z])",)),
    ("Scala", (r"(?<![A-Za-z])Scala(?![A-Za-z])",)),
    ("Spark", (r"(?<![A-Za-z])Spark(?![A-Za-z])",)),
    ("Hadoop", (r"(?<![A-Za-z])Hadoop(?![A-Za-z])",)),
    ("Hive", (r"(?<![A-Za-z])Hive(?![A-Za-z])",)),
    ("ClickHouse", (r"(?<![A-Za-z])ClickHouse(?![A-Za-z])",)),
    ("Kafka", (r"(?<![A-Za-z])Kafka(?![A-Za-z])",)),
    ("Flink", (r"(?<![A-Za-z])Flink(?![A-Za-z])",)),
    ("Airflow", (r"(?<![A-Za-z])Airflow(?![A-Za-z])",)),
    ("Linux", (r"(?<![A-Za-z])Linux(?![A-Za-z])",)),
    ("Shell", (r"(?<![A-Za-z])Shell(?![A-Za-z])",)),
    ("MySQL", (r"(?<![A-Za-z])MySQL(?![A-Za-z])",)),
    ("Oracle", (r"(?<![A-Za-z])Oracle(?![A-Za-z])",)),
    ("SQL Server", (r"SQL\s*Server",)),
    ("PostgreSQL", (r"(?<![A-Za-z])PostgreSQL(?![A-Za-z])",)),
    ("MongoDB", (r"(?<![A-Za-z])MongoDB(?![A-Za-z])",)),
    ("Redis", (r"(?<![A-Za-z])Redis(?![A-Za-z])",)),
    ("Pandas", (r"(?<![A-Za-z])Pandas(?![A-Za-z])",)),
    ("NumPy", (r"(?<![A-Za-z])NumPy(?![A-Za-z])",)),
    ("TensorFlow", (r"(?<![A-Za-z])TensorFlow(?![A-Za-z])",)),
    ("PyTorch", (r"(?<![A-Za-z])PyTorch(?![A-Za-z])",)),
    ("Scikit-learn", (r"Scikit[- ]?learn", r"(?<![A-Za-z])sklearn(?![A-Za-z])")),
    ("Git", (r"(?<![A-Za-z])Git(?![A-Za-z])",)),
    ("数据仓库", ("数据仓库",)),
    ("数据建模", ("数据建模",)),
    ("ETL", (r"(?<![A-Za-z])ETL(?![A-Za-z])",)),
    ("数据挖掘", ("数据挖掘",)),
    ("机器学习", ("机器学习",)),
    ("深度学习", ("深度学习",)),
    ("统计分析", ("统计分析", "统计学")),
    ("A/B测试", ("A/B测试", "AB测试")),
    ("用户画像", ("用户画像",)),
    ("推荐系统", ("推荐系统", "推荐算法")),
    ("自然语言处理", ("自然语言处理", r"(?<![A-Za-z])NLP(?![A-Za-z])")),
    ("数据分析", ("数据分析", "商业分析", "业务分析")),
)


@dataclass(frozen=True)
class LoadedDataset:
    """一次数据读取和去重后的可审计结果。"""

    frame: pd.DataFrame
    input_rows: int
    exact_duplicate_rows: int
    business_duplicate_rows: int

    @property
    def duplicate_rows(self) -> int:
        return self.exact_duplicate_rows + self.business_duplicate_rows


def clean_text(value: object) -> str:
    """清除不间断空格、换行和列表标记并压缩空白。"""
    if value is None or pd.isna(value):
        return ""
    return _WHITESPACE.sub(" ", str(value)).strip(" ,，;；")


def parse_list_field(value: object) -> list[str]:
    """解析天池 CSV 中的 Python 列表字符串，并对异常文本降级处理。"""
    text = clean_text(value)
    if not text:
        return []
    try:
        parsed = ast.literal_eval(text)
    except (SyntaxError, ValueError):
        return [text]
    if isinstance(parsed, (list, tuple, set)):
        return [item for item in (clean_text(entry) for entry in parsed) if item]
    normalized = clean_text(parsed)
    return [normalized] if normalized else []


def normalize_city_and_district(value: object) -> tuple[str | None, str | None]:
    """将“城市-区域”拆为城市和区域，拒绝异地招聘与异常值。"""
    text = clean_text(value)
    if not text or "异地" in text or re.fullmatch(r"[\d\s.-]+", text):
        return None, None
    parts = _CITY_SEPARATOR.split(text, maxsplit=1)
    city = re.sub(r"(市|地区)$", "", parts[0].strip())
    district = clean_text(parts[1]) if len(parts) > 1 else None
    if not city or not re.search(r"[\u4e00-\u9fff]", city):
        return None, None
    return city, district


def normalize_education(value: object) -> str | None:
    """把原始学历要求归并到平台统一展示档位。"""
    text = clean_text(value)
    if not text:
        return None
    if "博士" in text:
        return "博士"
    if "硕士" in text:
        return "硕士"
    if "本科" in text:
        return "本科"
    if "大专" in text or "专科" in text:
        return "大专"
    if any(token in text for token in ("中专", "中技", "高中", "初中", "技校")):
        return "中专及以下"
    if "不限" in text:
        return "不限"
    return None


def normalize_experience(value: object) -> str | None:
    """把原始经验要求归并到平台统一展示档位。"""
    text = clean_text(value).lower()
    if not text:
        return None
    if any(token in text for token in ("应届", "在校", "无需", "无经验")):
        return "应届/无经验"
    match = _EXPERIENCE_RANGE.search(text)
    if not match:
        return "不限" if "不限" in text else None
    low = int(match.group(1))
    high = int(match.group(2) or low)
    if high <= 3:
        return "1-3年"
    if high <= 5:
        return "3-5年"
    if high <= 9:
        return "5-10年"
    return "10年以上"


def extract_skills(description: str) -> list[str]:
    """从中文职位描述中按受控词典提取技能，避免自由分词引入噪声。"""
    matched: list[str] = []
    for skill, patterns in _SKILL_PATTERNS:
        if any(re.search(pattern, description, flags=re.IGNORECASE) for pattern in patterns):
            matched.append(skill)
    return matched


def _find_metadata(metadata: list[str], tokens: tuple[str, ...]) -> str | None:
    for item in metadata:
        if any(token in item for token in tokens):
            return item
    return None


def _first_value(values: list[str]) -> str | None:
    return values[0] if values else None


def normalize_industry(value: object) -> str | None:
    """从行业列表字符串中取第一个主行业，并去掉同项内的附加行业。"""
    values = parse_list_field(value)
    first = _first_value(values)
    if not first:
        return None
    primary = re.split(r"[,，;；]", first, maxsplit=1)[0].strip()
    return primary or None


def _business_key(row: dict[str, object]) -> str:
    fields = (
        "title",
        "company",
        "city",
        "district",
        "salary",
        "education",
        "experience",
        "industry",
        "description",
    )
    return "|".join(clean_text(row.get(field)).casefold() for field in fields)


def load_tianchi_163746(input_path: Path) -> LoadedDataset:
    """读取并标准化天池 163746 数据集，保留去重统计供分析摘要使用。"""
    raw = pd.read_csv(
        input_path,
        encoding="gb18030",
        header=None,
        dtype=str,
        keep_default_na=False,
    )
    if raw.shape[1] != 10:
        raise ValueError(f"天池数据集应包含 10 列，实际为 {raw.shape[1]} 列")

    input_rows = len(raw)
    unique_raw = raw.drop_duplicates()
    exact_duplicate_rows = input_rows - len(unique_raw)
    normalized_rows: list[dict[str, object]] = []
    for row in unique_raw.itertuples(index=False, name=None):
        city, district = normalize_city_and_district(row[2])
        metadata = parse_list_field(row[5])
        description_items = parse_list_field(row[9])
        description = " ".join(description_items)
        normalized_rows.append(
            {
                "title": clean_text(row[0]),
                "company": clean_text(row[1]),
                "city": city,
                "district": district,
                "salary": clean_text(row[3]),
                "publish_month_day": clean_text(row[4]),
                "education": normalize_education(
                    _find_metadata(metadata, ("学历", "本科", "大专", "专科", "硕士", "博士", "中专", "高中", "不限"))
                ),
                "experience": normalize_experience(
                    _find_metadata(metadata, ("经验", "应届", "在校", "无需"))
                ),
                "industry": normalize_industry(row[8]),
                "description": description,
                "skills": extract_skills(description),
            }
        )

    frame = pd.DataFrame(normalized_rows)
    frame["_business_key"] = frame.apply(lambda row: _business_key(row.to_dict()), axis=1)
    before_business_dedup = len(frame)
    frame = frame.drop_duplicates(subset="_business_key", keep="first").drop(columns="_business_key")
    business_duplicate_rows = before_business_dedup - len(frame)
    return LoadedDataset(
        frame=frame.reset_index(drop=True),
        input_rows=input_rows,
        exact_duplicate_rows=exact_duplicate_rows,
        business_duplicate_rows=business_duplicate_rows,
    )
