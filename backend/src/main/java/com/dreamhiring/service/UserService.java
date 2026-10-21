package com.dreamhiring.service;

import com.dreamhiring.dto.AuthRequests.ChangePasswordRequest;
import com.dreamhiring.dto.AuthRequests.UpdateProfileRequest;
import com.dreamhiring.vo.AuthViews.UserProfileView;

public interface UserService {

    UserProfileView getCurrentUser();

    UserProfileView updateCurrentUser(UpdateProfileRequest request);

    void changePassword(ChangePasswordRequest request);
}
