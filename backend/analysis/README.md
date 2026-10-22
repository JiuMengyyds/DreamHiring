# 招聘数据离线分析

该目录实现架构方案中的 Python pandas/NumPy 离线分析线。当前正式开发数据源为阿里云天池数据集 `163746`，只使用中文招聘数据。脚本完成去重、城市归一、薪资单位和区间统一、学历/经验标准化、行业归并和中文职位描述技能提取，并生成：

- `analysis_stat`：薪资、城市、学历、经验、行业分布。
- `analysis_hot_skill`：技能频次。

默认只生成 SQL，便于先审查清洗结果，不会直接修改数据库。

## 使用

```powershell
. E:\develop\tools\DreamHiring-DevEnv\Activate-DreamHiringEnv.ps1
python .\backend\analysis\job_market_analysis.py `
  --input .\data\raw\数据分析.csv `
  --format tianchi-163746 `
  --output .\backend\analysis\tianchi-output.sql `
  --source-dataset 阿里云天池-招聘数据分析数据集163746
```

确认 SQL 后，通过环境变量提供数据库凭据并写入：

```powershell
$env:DREAMHIRING_DB_USERNAME = 'dreamhiring'
$env:DREAMHIRING_DB_PASSWORD = '<由本机安全配置提供>'
python .\backend\analysis\job_market_analysis.py `
  --input .\data\raw\数据分析.csv `
  --format tianchi-163746 `
  --execute `
  --mysql E:\develop\tools\mysql-8.4.11-winx64\bin\mysql.exe
```

密码通过进程环境变量传递给本机 mysql 客户端，不写入仓库或 SQL 文件。脚本会先删除同一“数据集 + 统计日期”的旧结果，再在同一事务中写入新结果。

## 输入格式

`--format standard` 用于带表头的小样本 CSV，必要字段为 `title`、`city`；可选字段为 `company`、`salary`、`education`、`experience`、`industry`、`skills`。

`--format tianchi-163746` 用于阿里云天池原始文件。适配器按以下规则处理：

- 使用 `GB18030` 编码和 `header=None` 读取 10 列数据。
- 从列表字符串中解析经验、学历和行业。
- 薪资支持千/月、万/月、万/年和元/天，统一为月薪 K。
- 只保留标题、城市、薪资、学历和经验均有效的样本。
- 从中文职位描述提取技能，不读取英文数据集。

数据来源、清洗口径、样本摘要和许可证风险见 [sources/tianchi-163746.md](sources/tianchi-163746.md)。

## 测试

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\backend\analysis\tests\run-tests.ps1
```

测试覆盖薪资格式、天池列表字段、城市拆分、学历/经验映射、中文描述技能提取、完全重复与业务键去重、有效样本过滤、统计摘要和 SQL 生成。
