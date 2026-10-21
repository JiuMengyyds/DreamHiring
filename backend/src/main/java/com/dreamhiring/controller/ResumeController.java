package com.dreamhiring.controller;

import com.dreamhiring.common.Result;
import com.dreamhiring.dto.ResumeRequests.ResumeUpsertRequest;
import com.dreamhiring.service.ResumeService;
import com.dreamhiring.vo.ResumeView;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

@RestController
@RequestMapping("/api/resumes")
@PreAuthorize("hasRole('SEEKER')")
public class ResumeController {

    private final ResumeService resumeService;

    public ResumeController(ResumeService resumeService) {
        this.resumeService = resumeService;
    }

    @GetMapping
    public Result<List<ResumeView>> list() {
        return Result.success(resumeService.listMine());
    }

    @PostMapping
    public Result<ResumeView> create(@Valid @RequestBody ResumeUpsertRequest request) {
        return Result.success(resumeService.create(request));
    }

    @GetMapping("/{resumeId}")
    public Result<ResumeView> detail(@PathVariable Long resumeId) {
        return Result.success(resumeService.detail(resumeId));
    }

    @PutMapping("/{resumeId}")
    public Result<ResumeView> update(
            @PathVariable Long resumeId,
            @Valid @RequestBody ResumeUpsertRequest request
    ) {
        return Result.success(resumeService.update(resumeId, request));
    }

    @DeleteMapping("/{resumeId}")
    public Result<Void> delete(@PathVariable Long resumeId) {
        resumeService.delete(resumeId);
        return Result.success();
    }

    @PutMapping("/{resumeId}/default")
    public Result<ResumeView> setDefault(@PathVariable Long resumeId) {
        return Result.success(resumeService.setDefault(resumeId));
    }

    @PostMapping("/{resumeId}/attachment")
    public Result<ResumeView> uploadAttachment(
            @PathVariable Long resumeId,
            @RequestPart("file") MultipartFile file
    ) {
        return Result.success(resumeService.uploadAttachment(resumeId, file));
    }
}
