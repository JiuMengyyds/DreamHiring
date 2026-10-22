from __future__ import annotations

import csv
import sys
import tempfile
import unittest
from pathlib import Path


ANALYSIS_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ANALYSIS_DIR))

from adapters.tianchi_163746 import (  # noqa: E402
    extract_skills,
    normalize_city_and_district,
    normalize_education,
    normalize_experience,
    normalize_industry,
    parse_list_field,
)
from job_market_analysis import analyze, build_sql, parse_salary, split_skills  # noqa: E402


class JobMarketAnalysisTest(unittest.TestCase):
    def test_salary_units_should_be_normalized_to_thousands(self) -> None:
        self.assertEqual(parse_salary("20-30K·14薪"), (20.0, 30.0))
        self.assertEqual(parse_salary("1.5-2万"), (15.0, 20.0))
        self.assertEqual(parse_salary("15000-25000元"), (15.0, 25.0))
        self.assertEqual(parse_salary("5-8千/月"), (5.0, 8.0))
        self.assertEqual(parse_salary("10-15万/年"), (8.33, 12.5))
        self.assertEqual(parse_salary("300-500元/天"), (6.52, 10.88))
        self.assertEqual(parse_salary("面议"), (None, None))

    def test_skills_should_be_split_and_deduplicated_by_set_usage(self) -> None:
        self.assertEqual(split_skills("Java, SQL；Python/Java"), ["Java", "SQL", "Python", "Java"])

    def test_analysis_should_clean_rows_and_generate_sql(self) -> None:
        csv = (
            "title,company,city,salary,education,experience,industry,skills\n"
            "A,甲,杭州市,20-30K,本科,3-5年,企业服务,\"Java,SQL\"\n"
            "A,甲,杭州市,20-30K,本科,3-5年,企业服务,\"Java,SQL\"\n"
            "B,乙,,30-40K,硕士,5-10年,人工智能,\"Python,SQL\"\n"
            "C,丙,上海,面议,本科,应届,互联网,\"Vue,TypeScript\"\n"
        )
        with tempfile.TemporaryDirectory() as directory:
            input_path = Path(directory) / "jobs.csv"
            input_path.write_text(csv, encoding="utf-8")
            stats, hot_skills, summary = analyze(input_path, "测试数据集")

        self.assertEqual(summary.input_rows, 4)
        self.assertEqual(summary.valid_rows, 2)
        self.assertEqual(summary.duplicate_rows, 1)
        self.assertEqual(summary.invalid_city_rows, 1)
        self.assertEqual(dict(hot_skills)["Java"], 1)
        self.assertEqual(dict(hot_skills)["SQL"], 1)

        sql = build_sql(stats, hot_skills, summary)
        self.assertIn("START TRANSACTION;", sql)
        self.assertIn("DELETE FROM analysis_stat", sql)
        self.assertIn("INSERT INTO analysis_stat", sql)
        self.assertIn("INSERT INTO analysis_hot_skill", sql)
        self.assertIn("COMMIT;", sql)

    def test_tianchi_list_fields_and_location_should_be_normalized(self) -> None:
        self.assertEqual(
            parse_list_field("['\\xa0\\xa03-4年经验\\xa0\\xa0', '\\xa0\\xa0本科\\xa0\\xa0']"),
            ["3-4年经验", "本科"],
        )
        self.assertEqual(normalize_city_and_district("深圳-南山区"), ("深圳", "南山区"))
        self.assertEqual(normalize_city_and_district("异地招聘"), (None, None))
        self.assertEqual(
            normalize_industry("['互联网/电子商务,贸易/进出口']"),
            "互联网/电子商务",
        )

    def test_tianchi_education_and_experience_should_use_display_buckets(self) -> None:
        self.assertEqual(normalize_education("\\xa0\\xa0本科\\xa0\\xa0"), "本科")
        self.assertEqual(normalize_education("中专/中技"), "中专及以下")
        self.assertEqual(normalize_experience("在校生/应届生"), "应届/无经验")
        self.assertEqual(normalize_experience("2年经验"), "1-3年")
        self.assertEqual(normalize_experience("3-4年经验"), "3-5年")
        self.assertEqual(normalize_experience("8-9年经验"), "5-10年")

    def test_skills_should_be_extracted_from_chinese_description(self) -> None:
        skills = extract_skills("熟悉 Python、Excel 和 SQL，能够使用机器学习完成数据分析")
        self.assertEqual(skills, ["Python", "SQL", "Excel", "机器学习", "数据分析"])
        self.assertEqual(extract_skills("具备良好的沟通能力"), [])

    def test_tianchi_format_should_parse_gb18030_and_deduplicate(self) -> None:
        metadata = "['\\xa0\\xa03-4年经验\\xa0\\xa0', '\\xa0\\xa0本科\\xa0\\xa0']"
        rows = [
            ["数据分析师", "甲公司", "深圳-南山区", "1.5-3万/月", "07-08", metadata, "[]", "[]", "['互联网']", "['熟悉 Python、SQL 和 Excel']"],
            ["数据分析师", "甲公司", "深圳-南山区", "1.5-3万/月", "07-08", metadata, "[]", "[]", "['互联网']", "['熟悉 Python、SQL 和 Excel']"],
            ["数据分析师", "甲公司", "深圳-南山区", "1.5-3万/月", "08-09", metadata, "[]", "[]", "['互联网']", "['熟悉 Python、SQL 和 Excel']"],
            ["商业分析师", "乙公司", "异地招聘", "8-10千/月", "07-08", "['本科', '3-4年经验']", "[]", "[]", "['企业服务']", "[]"],
            ["数据专员", "丙公司", "上海-徐汇区", "面议", "07-08", "['本科', '1年经验']", "[]", "[]", "['金融']", "[]"],
            [
                "数据仓库工程师",
                "丁公司",
                "杭州",
                "10-15万/年",
                "07-08",
                "['5-7年经验', '硕士']",
                "[]",
                "[]",
                "['计算机软件']",
                "['负责数据仓库、ETL 和 Spark 开发']",
            ],
            [
                "数据助理",
                "戊公司",
                "北京",
                "6-8千/月",
                "07-08",
                "['在校生/应届生', '博士']",
                "[]",
                "[]",
                "['人工智能']",
                "['使用 Excel 完成统计分析']",
            ],
        ]
        with tempfile.TemporaryDirectory() as directory:
            input_path = Path(directory) / "tianchi.csv"
            with input_path.open("w", encoding="gb18030", newline="") as handle:
                csv.writer(handle).writerows(rows)
            stats, hot_skills, summary = analyze(
                input_path,
                "天池测试集",
                input_format="tianchi-163746",
            )

        self.assertEqual(summary.input_rows, 7)
        self.assertEqual(summary.valid_rows, 3)
        self.assertEqual(summary.duplicate_rows, 2)
        self.assertEqual(summary.invalid_city_rows, 1)
        self.assertEqual(dict(hot_skills)["Python"], 1)
        self.assertEqual(dict(hot_skills)["ETL"], 1)
        overview = stats[stats["dimension"] == "overview"].set_index("dim_value")["stat_value"]
        self.assertEqual(overview["sample_count"], 3)
        self.assertGreater(overview["average_salary"], 0)


if __name__ == "__main__":
    unittest.main()
