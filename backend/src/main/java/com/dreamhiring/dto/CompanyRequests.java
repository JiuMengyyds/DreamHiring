package com.dreamhiring.dto;

import com.dreamhiring.entity.DomainEnums.EducationLevel;
import com.dreamhiring.entity.DomainEnums.ExperienceLevel;
import com.dreamhiring.entity.DomainEnums.JobStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public final class CompanyRequests {

    private CompanyRequests() {
    }

    public record UpdateProfileRequest(
            @NotBlank(message = "企业名称不能为空")
            @Size(min = 2, max = 100, message = "企业名称长度必须为 2-100 个字符")
            String name,
            @NotBlank(message = "行业不能为空")
            @Size(max = 50, message = "行业不能超过 50 个字符")
            String industry,
            @Size(max = 30, message = "企业规模不能超过 30 个字符")
            String scale,
            @NotBlank(message = "城市不能为空")
            @Size(max = 50, message = "城市不能超过 50 个字符")
            String city,
            String logoUrl,
            @NotBlank(message = "企业简介不能为空")
            @Size(min = 20, max = 5000, message = "企业简介长度必须为 20-5000 个字符")
            String intro,
            @Size(max = 50, message = "联系人不能超过 50 个字符")
            String contactName,
            @Size(max = 20, message = "联系电话不能超过 20 个字符")
            String contactPhone,
            @Email(message = "联系邮箱格式不正确")
            @Size(max = 100, message = "联系邮箱不能超过 100 个字符")
            String contactEmail
    ) {
    }

    public record JobUpsertRequest(
            @NotBlank(message = "职位名称不能为空")
            @Size(min = 2, max = 100, message = "职位名称长度必须为 2-100 个字符")
            String title,
            @NotNull(message = "职位分类不能为空") Long categoryId,
            @NotBlank(message = "城市不能为空")
            @Size(max = 50, message = "城市不能超过 50 个字符")
            String city,
            @Size(max = 50, message = "区域不能超过 50 个字符")
            String district,
            @NotNull(message = "最低薪资不能为空")
            @Min(value = 1, message = "最低薪资必须大于 0")
            @jakarta.validation.constraints.Max(value = 1000, message = "最低薪资不能超过 1000")
            Integer salaryMin,
            @NotNull(message = "最高薪资不能为空")
            @Min(value = 1, message = "最高薪资必须大于 0")
            @jakarta.validation.constraints.Max(value = 1000, message = "最高薪资不能超过 1000")
            Integer salaryMax,
            @NotNull(message = "学历不能为空") EducationLevel education,
            @NotNull(message = "经验不能为空") ExperienceLevel experience,
            @NotBlank(message = "职位描述不能为空")
            @Size(min = 20, max = 10000, message = "职位描述长度必须为 20-10000 个字符")
            String description,
            @NotNull(message = "技能标签不能为空")
            @Size(min = 1, max = 30, message = "技能标签数量必须为 1-30 个")
            List<@NotBlank(message = "技能标签不能为空") String> skillTags,
            @Size(max = 30, message = "工作职责最多 30 条")
            List<@NotBlank(message = "工作职责不能为空") String> duties,
            @Size(max = 30, message = "任职要求最多 30 条")
            List<@NotBlank(message = "任职要求不能为空") String> requirements,
            @Size(max = 30, message = "职位福利最多 30 条")
            List<@NotBlank(message = "职位福利不能为空") String> perks
    ) {
    }

    public record JobStatusRequest(
            @NotNull(message = "职位状态不能为空") JobStatus status
    ) {
    }
}
