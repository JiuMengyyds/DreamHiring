package com.dreamhiring.controller;

import com.dreamhiring.common.PageVO;
import com.dreamhiring.common.Result;
import com.dreamhiring.service.AnnouncementService;
import com.dreamhiring.vo.AnnouncementView;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/announcements")
public class AnnouncementController {

    private final AnnouncementService announcementService;

    public AnnouncementController(AnnouncementService announcementService) {
        this.announcementService = announcementService;
    }

    @GetMapping
    public Result<PageVO<AnnouncementView>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return Result.success(announcementService.listPublished(page, size));
    }

    @GetMapping("/{announcementId}")
    public Result<AnnouncementView> detail(@PathVariable Long announcementId) {
        return Result.success(announcementService.detail(announcementId));
    }
}
