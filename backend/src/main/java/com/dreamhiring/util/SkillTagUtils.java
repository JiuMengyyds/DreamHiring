package com.dreamhiring.util;

import java.util.Arrays;
import java.util.List;

public final class SkillTagUtils {

    private SkillTagUtils() {
    }

    public static List<String> split(String tags) {
        if (tags == null || tags.isBlank()) {
            return List.of();
        }
        return Arrays.stream(tags.split("[,;，；|\\r\\n]+"))
                .map(String::trim)
                .filter(tag -> !tag.isBlank())
                .distinct()
                .toList();
    }

    public static String join(List<String> tags) {
        if (tags == null || tags.isEmpty()) {
            return "";
        }
        return tags.stream()
                .filter(tag -> tag != null && !tag.isBlank())
                .map(String::trim)
                .distinct()
                .reduce((left, right) -> left + "," + right)
                .orElse("");
    }
}
