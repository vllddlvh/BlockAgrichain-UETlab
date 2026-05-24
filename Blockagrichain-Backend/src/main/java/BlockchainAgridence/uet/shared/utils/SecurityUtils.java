package BlockchainAgridence.uet.shared.utils;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

public class SecurityUtils {

    public static String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof Jwt jwt) {
            return jwt.getSubject();
        }
        return null;
    }

    public static UUID getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof Jwt jwt) {
            String userIdStr = jwt.getClaimAsString("userId");
            if (userIdStr != null) {
                return UUID.fromString(userIdStr);
            }
        }
        return null;
    }

    public static UUID getCurrentUserOrgId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof Jwt jwt) {
            String orgIdStr = jwt.getClaimAsString("orgId");
            if (orgIdStr != null) {
                return UUID.fromString(orgIdStr);
            }
        }
        return null;
    }

    // Returns role codes from JWT scope claim, e.g. ["FARM_ADMIN", "STAFF"]
    public static List<String> getCurrentUserRoles() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof Jwt jwt) {
            String scope = jwt.getClaimAsString("scope");
            if (scope != null && !scope.isBlank()) {
                return Arrays.stream(scope.split(" "))
                        .filter(s -> s.startsWith("ROLE_"))
                        .map(s -> s.substring(5))
                        .toList();
            }
        }
        return Collections.emptyList();
    }
}
