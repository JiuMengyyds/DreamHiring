package com.dreamhiring.service;

import com.dreamhiring.common.PageVO;
import com.dreamhiring.vo.AnnouncementView;

public interface AnnouncementService {

    PageVO<AnnouncementView> listPublished(int page, int size);

    AnnouncementView detail(Long announcementId);
}
