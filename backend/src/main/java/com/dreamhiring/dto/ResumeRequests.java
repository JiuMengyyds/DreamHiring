package com.dreamhiring.dto;

import com.dreamhiring.entity.DomainEnums.EducationLevel;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public final class ResumeRequests {

    private ResumeRequests() {
    }

    public record ResumeUpsertRequest(
            @NotBlank(message = "姓名不能为空")
            @Size(max = 50, message = "姓名不能超过 50 个字符")
            String name,
            @Size(max = 100, message = "求职方向不能超过 100 个字符")
            String title,
            @NotNull(message = "学历不能为空")
            EducationLevel education,
            @NotNull(message = "工作年限不能为空")
            @Min(value = 0, message = "工作年限不能小于 0")
            @Max(value = 60, message = "工作年限不能超过 60")
            Integer experienceYears,
            @Size(max = 50, message = "当前城市不能超过 50 个字符")
            String currentCity,
            @NotBlank(message = "期望城市不能为空")
            @Size(max = 100, message = "期望城市不能超过 100 个字符")
            String expectCity,
            @Min(value = 0, message = "期望最低薪资不能小于 0")
            @Max(value = 1000, message = "期望最低薪资不能超过 1000")
            Integer expectSalaryMin,
            @Min(value = 0, message = "期望最高薪资不能小于 0")
            @Max(value = 1000, message = "期望最高薪资不能超过 1000")
            Integer expectSalaryMax,
            @NotNull(message = "技能标签不能为空")
            @Size(max = 30, message = "技能标签最多 30 个")
            List<@NotBlank(message = "技能标签不能包含空值") String> skillTags,
            @NotBlank(message = "个人简介不能为空")
            @Size(max = 2000, message = "个人简介不能超过 2000 个字符")
            String summary
    ) {
    }
}
