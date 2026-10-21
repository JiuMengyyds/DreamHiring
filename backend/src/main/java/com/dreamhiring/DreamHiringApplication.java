package com.dreamhiring;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.util.TimeZone;

/**
 * DreamHiring 招聘平台后端启动入口。
 */
@SpringBootApplication
public class DreamHiringApplication {

    public static void main(String[] args) {
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Shanghai"));
        SpringApplication.run(DreamHiringApplication.class, args);
    }
}
