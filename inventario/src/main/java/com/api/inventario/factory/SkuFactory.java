package com.api.inventario.factory;

import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.springframework.stereotype.Component;

@Component
public class SkuFactory {

    /*
     * Factory centralizada para construir SKUs automaticos.
     * Si cambia el formato del codigo, el cambio queda aislado en esta clase.
     */
    private static final int SKU_NUMBER_WIDTH = 6;

    public String nextSku(String prefix, List<String> existingSkus) {
        Pattern pattern = Pattern.compile("^" + Pattern.quote(prefix) + "(\\d+)$");
        int maxNumber = existingSkus.stream()
                .map(pattern::matcher)
                .filter(Matcher::matches)
                .mapToInt(matcher -> Integer.parseInt(matcher.group(1)))
                .max()
                .orElse(0);

        return prefix + String.format("%0" + SKU_NUMBER_WIDTH + "d", maxNumber + 1);
    }
}
