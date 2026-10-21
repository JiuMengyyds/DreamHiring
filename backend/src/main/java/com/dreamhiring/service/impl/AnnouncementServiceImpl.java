package com.dreamhiring.service.impl;

import com.dreamhiring.common.BusinessException;
import com.dreamhiring.common.PageVO;
import com.dreamhiring.common.ResultCode;
import com.dreamhiring.entity.Announcement;
import com.dreamhiring.mapper.AnnouncementMapper;
import com.dreamhiring.service.AnnouncementService;
import com.dreamhiring.vo.AnnouncementView;
import com.github.pagehelper.Page;
import com.github.pagehelper.PageHelper;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AnnouncementServiceImpl implements AnnouncementService {

    private final AnnouncementMapper announcementMapper;

    public AnnouncementServiceImpl(AnnouncementMapper announcementMapper) {
        this.announcementMapper = announcementMapper;
    }

    @Override
    public PageVO<AnnouncementView> listPublished(int page, int size) {
        PageHelper.startPage(page, size);
        Page<Announcement> announcements = (Page<Announcement>) announcementMapper.findPublished();
        List<AnnouncementView> records = announcements.stream().map(AnnouncementServiceImpl::toView).toList();
        return PageVO.of(records, announcements.getTotal(), page, size);
    }

    @Override
    public AnnouncementView detail(Long announcementId) {
        Announcement announcement = announcementMapper.findById(announcementId);
        if (announcement == null || announcement.getStatus() != com.dreamhiring.entity.DomainEnums.AnnouncementStatus.PUBLISHED) {
            throw new BusinessException(ResultCode.NOT_FOUND, "公告不存在或已删除");
        }
        return toView(announcement);
    }

    static AnnouncementView toView(Announcement announcement) {
        return new AnnouncementView(
                announcement.getId(),
                announcement.getTitle(),
                announcement.getSummary(),
                announcement.getContent(),
                announcement.getChannel(),
                announcement.getStatus(),
                announcement.getPublisherId(),
                announcement.getPublishTime(),
                announcement.getCreateTime()
        );
    }
}
