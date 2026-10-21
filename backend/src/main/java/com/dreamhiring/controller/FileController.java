package com.dreamhiring.controller;

import com.dreamhiring.common.Result;
import com.dreamhiring.service.FileService;
import com.dreamhiring.vo.FileView;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/files")
public class FileController {

    private final FileService fileService;

    public FileController(FileService fileService) {
        this.fileService = fileService;
    }

    @PostMapping
    public Result<FileView> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam("scope") String scope
    ) {
        return Result.success(fileService.upload(scope, file));
    }
}
