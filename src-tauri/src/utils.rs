/// 判断 provider 是否支持 `thinking` 字段。
/// 目前只有 DeepSeek 官方 API 和 Kimi 支持该字段；
/// 第三方代理（OpenRouter / 反代）做严格校验时会以 400 拒绝整个请求。
pub fn provider_supports_thinking_field(base_url: &str) -> bool {
    let lower = base_url.to_ascii_lowercase();
    lower.contains("deepseek.com") || lower.contains("moonshot.cn")
}

/**
 * 解析目标语言
 * 当设置为 "auto" 时，根据文本内容自动判断：
 * - 如果文本包含中文，则目标语言为英文
 * - 否则目标语言为中文
 */
pub fn resolve_target_lang(target: &str, text: &str) -> String {
    resolve_target_lang_with_preference(target, text, "zh")
}

pub fn resolve_target_lang_with_preference(
    target: &str,
    text: &str,
    preferred_chinese: &str,
) -> String {
    if target == "auto" {
        if has_chinese(text) {
            "en".to_string()
        } else {
            crate::locale::normalize_model_language(preferred_chinese).to_string()
        }
    } else {
        match target.trim() {
            "zh-TW" | "zh-Hant" => "zh-Hant".to_string(),
            "zh" | "zh-CN" | "zh-Hans" => "zh".to_string(),
            "en" | "ja" | "ko" | "fr" | "de" => target.trim().to_string(),
            other => other.to_string(),
        }
    }
}

/**
 * 判断文本中是否包含中文字符
 */
pub fn has_chinese(text: &str) -> bool {
    text.chars().any(|c| ('\u{4e00}'..'\u{9fff}').contains(&c))
}

/**
 * 获取语言代码对应的显示名称
 */
pub fn language_name(code: &str) -> &'static str {
    match code {
        "ja" => "Japanese",
        "ko" => "Korean",
        "fr" => "French",
        "de" => "German",
        "en" => "English",
        _ => crate::locale::AppLocale::from_code(code).language_name(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn target_lang_auto_respects_traditional_chinese_preference() {
        assert_eq!(
            resolve_target_lang_with_preference("auto", "hello", "zh-TW"),
            "zh-Hant"
        );
        assert_eq!(
            resolve_target_lang_with_preference("auto", "hello", "zh-Hant"),
            "zh-Hant"
        );
        assert_eq!(
            resolve_target_lang_with_preference("auto", "hello", "zh"),
            "zh"
        );
    }

    #[test]
    fn target_lang_preserves_non_chinese_languages() {
        assert_eq!(
            resolve_target_lang_with_preference("ja", "hello", "zh-TW"),
            "ja"
        );
        assert_eq!(
            resolve_target_lang_with_preference("ko", "hello", "zh-TW"),
            "ko"
        );
        assert_eq!(
            resolve_target_lang_with_preference("fr", "hello", "zh-TW"),
            "fr"
        );
        assert_eq!(
            resolve_target_lang_with_preference("de", "hello", "zh-TW"),
            "de"
        );
    }

    #[test]
    fn language_names_include_zh_tw_alias() {
        assert_eq!(language_name("zh-TW"), "Traditional Chinese");
        assert_eq!(language_name("zh-Hant"), "Traditional Chinese");
        assert_eq!(language_name("zh"), "Simplified Chinese");
    }
}
