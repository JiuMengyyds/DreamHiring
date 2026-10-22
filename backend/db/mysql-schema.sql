CREATE DATABASE IF NOT EXISTS dream_hiring
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_unicode_ci;

USE dream_hiring;

CREATE TABLE IF NOT EXISTS sys_user (
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
    last_login_time DATETIME,
    create_time DATETIME NOT NULL,
    update_time DATETIME NOT NULL,
    deleted TINYINT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS company (
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
    create_time DATETIME NOT NULL,
    update_time DATETIME NOT NULL,
    deleted TINYINT NOT NULL DEFAULT 0,
    INDEX idx_company_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS job_category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    parent_id BIGINT,
    sort INT NOT NULL DEFAULT 0,
    deleted TINYINT NOT NULL DEFAULT 0,
    INDEX idx_category_parent (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS job (
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
    publish_time DATETIME,
    create_time DATETIME NOT NULL,
    update_time DATETIME NOT NULL,
    deleted TINYINT NOT NULL DEFAULT 0,
    INDEX idx_job_city_status_salary (city, status, salary_min),
    INDEX idx_job_company (company_id),
    INDEX idx_job_category (category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS resume (
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
    create_time DATETIME NOT NULL,
    update_time DATETIME NOT NULL,
    deleted TINYINT NOT NULL DEFAULT 0,
    INDEX idx_resume_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS application (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    resume_id BIGINT NOT NULL,
    job_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL,
    match_score INT NOT NULL,
    company_remark VARCHAR(255),
    delivery_time DATETIME NOT NULL,
    handle_time DATETIME,
    deleted TINYINT NOT NULL DEFAULT 0,
    UNIQUE KEY uk_resume_job (resume_id, job_id),
    INDEX idx_application_user (user_id),
    INDEX idx_application_job_status (job_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS message (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    receiver_id BIGINT NOT NULL,
    type VARCHAR(20) NOT NULL,
    title VARCHAR(100) NOT NULL,
    content VARCHAR(2000) NOT NULL,
    related_id BIGINT,
    dedup_key VARCHAR(100),
    is_read TINYINT NOT NULL DEFAULT 0,
    create_time DATETIME NOT NULL,
    deleted TINYINT NOT NULL DEFAULT 0,
    INDEX idx_message_receiver_read (receiver_id, is_read),
    UNIQUE KEY uk_message_dedup_key (dedup_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS dead_letter_message (
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
    create_time DATETIME NOT NULL,
    update_time DATETIME NOT NULL,
    replay_time DATETIME,
    INDEX idx_dead_letter_status_time (status, create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS announcement (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    summary VARCHAR(300),
    content VARCHAR(10000) NOT NULL,
    channel VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    publisher_id BIGINT NOT NULL,
    publish_time DATETIME,
    create_time DATETIME NOT NULL,
    update_time DATETIME NOT NULL,
    deleted TINYINT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS analysis_stat (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    dimension VARCHAR(30) NOT NULL,
    dim_value VARCHAR(100) NOT NULL,
    metric VARCHAR(30) NOT NULL,
    stat_value DECIMAL(12,2) NOT NULL,
    source_dataset VARCHAR(50),
    stat_date DATE NOT NULL,
    INDEX idx_stat_dimension_date (dimension, stat_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS analysis_hot_skill (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    skill VARCHAR(50) NOT NULL,
    freq_count INT NOT NULL,
    source_dataset VARCHAR(50),
    stat_date DATE NOT NULL,
    INDEX idx_hot_skill_date (stat_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS operation_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    operator_id BIGINT,
    resource_type VARCHAR(50) NOT NULL,
    resource_id BIGINT,
    action VARCHAR(100) NOT NULL,
    result VARCHAR(20) NOT NULL,
    detail VARCHAR(1000),
    create_time DATETIME NOT NULL,
    INDEX idx_operation_operator_time (operator_id, create_time),
    INDEX idx_operation_resource (resource_type, resource_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
