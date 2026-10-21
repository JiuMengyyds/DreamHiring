# 招聘数据离线分析

该目录实现架构方案中的 Python pandas/NumPy 离线分析线。脚本读取招聘 CSV，完成去重、城市归一、薪资单位和区间统一、学历/经验标准化，并生成：

- `analysis_stat`：薪资、城市、学历、经验、行业分布。
- `analysis_hot_skill`：技能频次。

默认只生成 SQL，便于先审查清洗结果，不会直接修改数据库。

## 使用

```powershell
. E:\develop\tools\DreamHiring-DevEnv\Activate-DreamHiringEnv.ps1
python .\backend\analysis\job_market_analysis.py `
  --input .\backend\analysis\sample-jobs.csv `
  --output .\backend\analysis\sample-output.sql `
  --source-dataset 演示招聘数据集
```

确认 SQL 后，通过环境变量提供数据库凭据并写入：

```powershell
$env:DREAMHIRING_DB_USERNAME = 'dreamhiring'
$env:DREAMHIRING_DB_PASSWORD = '<由本机安全配置提供>'
python .\backend\analysis\job_market_analysis.py `
  --input .\backend\analysis\sample-jobs.csv `
  --execute `
  --mysql E:\develop\tools\mysql-8.4.11-winx64\bin\mysql.exe
```

密码通过进程环境变量传递给本机 mysql 客户端，不写入仓库或 SQL 文件。脚本会先删除同一“数据集 + 统计日期”的旧结果，再在同一事务中写入新结果。

## 输入字段

必要字段为 `title`、`city`；可选字段为 `company`、`salary`、`education`、`experience`、`industry`、`skills`。技能支持逗号、分号、斜杠和竖线分隔。

## 测试

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\backend\analysis\tests\run-tests.ps1
```

测试覆盖薪资格式、技能拆分、重复/无效数据清理、统计摘要和 SQL 生成。
