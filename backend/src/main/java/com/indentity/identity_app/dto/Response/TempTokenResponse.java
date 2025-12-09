package com.indentity.identity_app.dto.Response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TempTokenResponse {
    private String temporaryToken;
}
