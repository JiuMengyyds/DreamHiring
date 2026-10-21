INSERT INTO sys_user (id, username, password_hash, nickname, role, status, phone, email, create_time, update_time)
VALUES
    (1, 'linzhixia', '{noop}dreamhiring', '林知夏', 'SEEKER', 'ACTIVE', '13800006271', 'zhixia.lin@example.com', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (2, 'chenyu_hr', '{noop}dreamhiring', '陈屿', 'COMPANY', 'ACTIVE', '13800002081', 'hr@nebula.example', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (3, 'admin_zhou', '{noop}dreamhiring', '周宁', 'ADMIN', 'ACTIVE', '13800008080', 'admin@dreamhiring.example', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO company (id, user_id, name, industry, scale, city, intro, contact_name, contact_phone, contact_email, audit_status, create_time, update_time)
VALUES (1, 2, '星云科技', '企业服务', '500-999人', '杭州', '专注企业协同与数字化办公。', '陈屿', '13800002081', 'hr@nebula.example', 'APPROVED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO job_category (id, name, parent_id, sort) VALUES
    (1, '产品 / 设计', NULL, 10),
    (2, '技术 / 研发', NULL, 20),
    (11, '产品经理', 1, 1),
    (12, 'UI 设计师', 1, 2);

INSERT INTO job (id, company_id, category_id, title, city, district, salary_min, salary_max, education, experience, description, duties, requirements, skill_tags, perks, status, audit_status, view_count, publish_time, create_time, update_time)
VALUES
    (1, 1, 12, '高级产品设计师', '杭州', '滨江区', 25, 38, 'BACHELOR', 'THREE_TO_FIVE', '负责企业协同产品的体验设计，参与设计系统建设并推动跨团队协作。', '负责核心产品体验设计；建设设计系统', '五年以上产品设计经验；熟悉 B 端产品', 'Figma,B端产品,设计系统,用户研究', '弹性工作,年度体检', 'PUBLISHED', 'APPROVED', 328, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (2, 1, 11, '产品经理（AI 方向）', '杭州', '滨江区', 30, 45, 'BACHELOR', 'THREE_TO_FIVE', '面向企业客户设计 AI 工作流产品，定义需求并推动产品从规划到上线。', '规划 AI 产品路线；推动跨团队交付', '三年以上 B 端产品经验；具备数据分析能力', 'B端产品,AI产品,数据分析', '年终奖,弹性工作', 'PUBLISHED', 'APPROVED', 412, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (3, 1, 12, 'UX 设计师', '上海', '徐汇区', 18, 28, 'BACHELOR', 'ONE_TO_THREE', '负责出行产品体验设计，参与用户研究并持续优化核心流程。', '完成交互方案；参与用户研究', '一至三年 UX 经验；熟悉 Figma', '交互设计,用户研究,Figma', '餐补,带薪年假', 'PUBLISHED', 'APPROVED', 197, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO resume (id, user_id, name, title, education, experience_years, current_city, expect_city, expect_salary_min, expect_salary_max, skill_tags, summary, attachment_object_key, is_default, create_time, update_time)
VALUES (1, 1, '林知夏', '产品设计师', 'BACHELOR', 4, '杭州', '杭州 / 上海', 25, 35, 'Figma,B端产品,设计系统,用户研究', '4 年 B 端产品体验设计经验。', 'resume/1/demo.pdf', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO application (id, resume_id, job_id, user_id, status, match_score, company_remark, delivery_time)
VALUES (1, 1, 1, 1, 'INTERVIEW', 100, '安排第一轮面试', CURRENT_TIMESTAMP);

INSERT INTO message (id, receiver_id, type, title, content, related_id, dedup_key, is_read, create_time)
VALUES (1, 1, 'APPLICATION', '星云科技邀请你参加面试', '请确认面试时间。', 1, 'LEGACY:1', 0, CURRENT_TIMESTAMP);

INSERT INTO announcement (id, title, summary, content, channel, status, publisher_id, publish_time, create_time, update_time)
VALUES (1, '2026 秋季招聘服务保障说明', '秋招期间将加强审核响应。', '平台已开启秋招专项服务保障。', 'ALL', 'PUBLISHED', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO analysis_stat (dimension, dim_value, metric, stat_value, source_dataset, stat_date)
VALUES
    ('salary', '8-12K', 'percent', 18, '中文招聘数据集', CURRENT_DATE),
    ('salary', '12-18K', 'percent', 32, '中文招聘数据集', CURRENT_DATE),
    ('salary', '18-25K', 'percent', 24, '中文招聘数据集', CURRENT_DATE),
    ('city', '杭州', 'percent', 15, '中文招聘数据集', CURRENT_DATE),
    ('city', '上海', 'percent', 24, '中文招聘数据集', CURRENT_DATE),
    ('education', '本科', 'percent', 42, '中文招聘数据集', CURRENT_DATE),
    ('experience', '3-5年', 'percent', 31, '中文招聘数据集', CURRENT_DATE),
    ('industry', '企业服务', 'percent', 18.6, '中文招聘数据集', CURRENT_DATE);

INSERT INTO analysis_hot_skill (skill, freq_count, source_dataset, stat_date)
VALUES ('Python', 1680, '英文技能数据集', CURRENT_DATE), ('Java', 1510, '英文技能数据集', CURRENT_DATE), ('SQL', 1260, '英文技能数据集', CURRENT_DATE);
