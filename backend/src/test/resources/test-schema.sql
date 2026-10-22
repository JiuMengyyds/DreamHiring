DROP TABLE IF EXISTS analysis_hot_skill;
DROP TABLE IF EXISTS analysis_stat;
DROP TABLE IF EXISTS operation_log;
DROP TABLE IF EXISTS message;
DROP TABLE IF EXISTS dead_letter_message;
DROP TABLE IF EXISTS announcement;
DROP TABLE IF EXISTS application;
DROP TABLE IF EXISTS resume;
DROP TABLE IF EXISTS job;
DROP TABLE IF EXISTS job_category;
DROP TABLE IF EXISTS company;
DROP TABLE IF EXISTS sys_user;

CREATE TABLE sys_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(100) NOT NULL,
    nickname VARCHAR(50),
    role VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    avatar_url VARCHAR(255),
    avatar_object_key VARCHAR(255),
    last_login_time TIMESTAMP,
    create_time TIMESTAMP NOT NULL,
    update_time TIMESTAMP NOT NULL,
    deleted TINYINT NOT NULL DEFAULT 0
);

CREATE TABLE company (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    industry VARCHAR(50),
    scale VARCHAR(30),
    city VARCHAR(50),
    logo_url VARCHAR(255),
    logo_object_key VARCHAR(255),
    intro VARCHAR(5000),
    contact_name VARCHAR(50),
    contact_phone VARCHAR(20),
    contact_email VARCHAR(100),
    audit_status VARCHAR(20) NOT NULL,
    audit_reason VARCHAR(255),
    create_time TIMESTAMP NOT NULL,
    update_time TIMESTAMP NOT NULL,
    deleted TINYINT NOT NULL DEFAULT 0
);

CREATE TABLE job_category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    parent_id BIGINT,
    sort INT NOT NULL DEFAULT 0,
    deleted TINYINT NOT NULL DEFAULT 0
);

CREATE TABLE job (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    company_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    title VARCHAR(100) NOT NULL,
    city VARCHAR(50) NOT NULL,
    district VARCHAR(50),
    salary_min INT NOT NULL,
    salary_max INT NOT NULL,
    education VARCHAR(20) NOT NULL,
    experience VARCHAR(20) NOT NULL,
    description VARCHAR(10000),
    duties VARCHAR(4000),
    requirements VARCHAR(4000),
    skill_tags VARCHAR(1000),
    perks VARCHAR(1000),
    status VARCHAR(20) NOT NULL,
    audit_status VARCHAR(20) NOT NULL,
    audit_reason VARCHAR(255),
    view_count INT NOT NULL DEFAULT 0,
    publish_time TIMESTAMP,
    create_time TIMESTAMP NOT NULL,
    update_time TIMESTAMP NOT NULL,
    deleted TINYINT NOT NULL DEFAULT 0
);

CREATE TABLE resume (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    name VARCHAR(50) NOT NULL,
    title VARCHAR(100),
    education VARCHAR(20) NOT NULL,
    experience_years INT NOT NULL,
    current_city VARCHAR(50),
    expect_city VARCHAR(100),
    expect_salary_min INT,
    expect_salary_max INT,
    skill_tags VARCHAR(1000),
    summary VARCHAR(2000),
    attachment_object_key VARCHAR(255),
    is_default TINYINT NOT NULL DEFAULT 0,
    create_time TIMESTAMP NOT NULL,
    update_time TIMESTAMP NOT NULL,
    deleted TINYINT NOT NULL DEFAULT 0
);

CREATE TABLE application (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    resume_id BIGINT NOT NULL,
    job_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL,
    match_score INT NOT NULL,
    company_remark VARCHAR(255),
    delivery_time TIMESTAMP NOT NULL,
    handle_time TIMESTAMP,
    deleted TINYINT NOT NULL DEFAULT 0,
    UNIQUE (resume_id, job_id)
);

CREATE TABLE message (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    receiver_id BIGINT NOT NULL,
    type VARCHAR(20) NOT NULL,
    title VARCHAR(100) NOT NULL,
    content VARCHAR(2000) NOT NULL,
    related_id BIGINT,
    dedup_key VARCHAR(100),
    is_read TINYINT NOT NULL DEFAULT 0,
    create_time TIMESTAMP NOT NULL,
    deleted TINYINT NOT NULL DEFAULT 0,
    UNIQUE (dedup_key)
);

CREATE TABLE dead_letter_message (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    queue_name VARCHAR(120) NOT NULL,
    exchange_name VARCHAR(120) NOT NULL,
    routing_key VARCHAR(150) NOT NULL,
    message_id VARCHAR(100),
    correlation_id VARCHAR(100),
    message_body LONGTEXT NOT NULL,
    content_type VARCHAR(100),
    headers_json LONGTEXT,
    failure_reason VARCHAR(1000),
    status VARCHAR(20) NOT NULL,
    replay_count INT NOT NULL DEFAULT 0,
    create_time TIMESTAMP NOT NULL,
    update_time TIMESTAMP NOT NULL,
    replay_time TIMESTAMP
);

CREATE TABLE announcement (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    summary VARCHAR(300),
    content VARCHAR(10000) NOT NULL,
    channel VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    publisher_id BIGINT NOT NULL,
    publish_time TIMESTAMP,
    create_time TIMESTAMP NOT NULL,
    update_time TIMESTAMP NOT NULL,
    deleted TINYINT NOT NULL DEFAULT 0
);

CREATE TABLE analysis_stat (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    dimension VARCHAR(30) NOT NULL,
    dim_value VARCHAR(100) NOT NULL,
    metric VARCHAR(30) NOT NULL,
    stat_value DECIMAL(12,2) NOT NULL,
    source_dataset VARCHAR(50),
    stat_date DATE NOT NULL
);

CREATE TABLE analysis_hot_skill (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    skill VARCHAR(50) NOT NULL,
    freq_count INT NOT NULL,
    source_dataset VARCHAR(50),
    stat_date DATE NOT NULL
);

CREATE TABLE operation_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    operator_id BIGINT,
    resource_type VARCHAR(50) NOT NULL,
    resource_id BIGINT,
    action VARCHAR(100) NOT NULL,
    result VARCHAR(20) NOT NULL,
    detail VARCHAR(1000),
    create_time TIMESTAMP NOT NULL
);
