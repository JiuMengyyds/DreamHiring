USE dream_hiring;

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
