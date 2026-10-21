from __future__ import annotations

import sys
import tempfile
import unittest
from pathlib import Path


ANALYSIS_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ANALYSIS_DIR))

from job_market_analysis import analyze, build_sql, parse_salary, split_skills  # noqa: E402


class JobMarketAnalysisTest(unittest.TestCase):
    def test_salary_units_should_be_normalized_to_thousands(self) -> None:
        self.assertEqual(parse_salary("20-30K·14薪"), (20.0, 30.0))
        self.assertEqual(parse_salary("1.5-2万"), (15.0, 20.0))
        self.assertEqual(parse_salary("15000-25000元"), (15.0, 25.0))
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


if __name__ == "__main__":
    unittest.main()
