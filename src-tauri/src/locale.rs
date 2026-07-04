#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum AppLocale {
    ZhHans,
    ZhHant,
    En,
}

impl AppLocale {
    pub fn parse(code: &str) -> Option<Self> {
        match code.trim().to_ascii_lowercase().as_str() {
            "" => None,
            "en" | "en-us" | "en-gb" => Some(Self::En),
            "zh-tw" | "zh-hant" | "zh_hant" | "zh-hk" | "zh-mo" => Some(Self::ZhHant),
            "zh" | "zh-cn" | "zh-hans" | "zh_hans" | "zh-sg" => Some(Self::ZhHans),
            value if value.starts_with("zh") && value.contains("hant") => Some(Self::ZhHant),
            value if value.starts_with("zh") => Some(Self::ZhHans),
            _ => None,
        }
    }

    pub fn from_code(code: &str) -> Self {
        Self::parse(code).unwrap_or(Self::En)
    }

    pub fn settings_code(self) -> &'static str {
        match self {
            Self::ZhHans => "zh",
            Self::ZhHant => "zh-TW",
            Self::En => "en",
        }
    }

    pub fn model_code(self) -> &'static str {
        match self {
            Self::ZhHans => "zh",
            Self::ZhHant => "zh-Hant",
            Self::En => "en",
        }
    }

    pub fn language_name(self) -> &'static str {
        match self {
            Self::ZhHans => "Simplified Chinese",
            Self::ZhHant => "Traditional Chinese",
            Self::En => "English",
        }
    }

    pub fn is_chinese(self) -> bool {
        matches!(self, Self::ZhHans | Self::ZhHant)
    }

    pub fn is_traditional_chinese(self) -> bool {
        matches!(self, Self::ZhHant)
    }
}

pub fn normalize_settings_language(code: &str) -> &'static str {
    AppLocale::parse(code)
        .unwrap_or(AppLocale::ZhHant)
        .settings_code()
}

pub fn normalize_model_language(code: &str) -> &'static str {
    AppLocale::parse(code)
        .unwrap_or(AppLocale::ZhHant)
        .model_code()
}

pub fn try_normalize_model_language(code: &str) -> Option<&'static str> {
    AppLocale::parse(code).map(AppLocale::model_code)
}

pub fn is_chinese_language(code: &str) -> bool {
    AppLocale::parse(code).is_some_and(AppLocale::is_chinese)
}

pub fn is_traditional_chinese(code: &str) -> bool {
    AppLocale::parse(code).is_some_and(AppLocale::is_traditional_chinese)
}

pub fn localized_zh_or_en(language: &str, zh_hans: &str, en: &str) -> String {
    match AppLocale::from_code(language) {
        AppLocale::En => en.to_string(),
        AppLocale::ZhHans => zh_hans.to_string(),
        AppLocale::ZhHant => simplified_to_traditional(zh_hans),
    }
}

pub fn localize_zh_hans(language: &str, text: String) -> String {
    if is_traditional_chinese(language) {
        simplified_to_traditional(&text)
    } else {
        text
    }
}

pub fn simplified_to_traditional(text: &str) -> String {
    let mut out = text.to_string();
    for (from, to) in S2T_PHRASE_REPLACEMENTS {
        out = out.replace(from, to);
    }
    out.chars()
        .map(|ch| {
            S2T_CHAR_REPLACEMENTS
                .iter()
                .find_map(|(from, to)| (*from == ch).then_some(*to))
                .unwrap_or(ch)
        })
        .collect()
}

const S2T_PHRASE_REPLACEMENTS: &[(&str, &str)] = &[
    ("OpenAI 兼容", "OpenAI 相容"),
    ("Agent plan mode", "Agent plan mode"),
    ("Agent orchestrate mode", "Agent orchestrate mode"),
    ("Agent plan context", "Agent plan context"),
    ("当前本地时间", "目前本機時間"),
    ("系统时钟", "系統時鐘"),
    ("回答今天", "回答今天"),
    ("禁止凭记忆臆测", "禁止憑記憶臆測"),
    ("智能助手", "智慧助理"),
    ("视觉上下文", "視覺上下文"),
    ("概念解释", "概念解釋"),
    ("操作协助", "操作協助"),
    ("保持回答简洁直接", "保持回答簡潔直接"),
    ("自然流畅", "自然流暢"),
    ("小标题", "小標題"),
    ("数学公式", "數學公式"),
    ("思考保持简洁", "思考保持簡潔"),
    ("避免反复重述", "避免反覆重述"),
    ("系统提示", "系統提示"),
    ("系统提示词", "系統提示詞"),
    ("提示词", "提示詞"),
    ("用户", "使用者"),
    ("助手", "助理"),
    ("对话", "對話"),
    ("回复", "回覆"),
    ("响应", "回應"),
    ("默认", "預設"),
    ("当前", "目前"),
    ("设置", "設定"),
    ("截图", "截圖"),
    ("视觉", "視覺"),
    ("图片", "圖片"),
    ("信息", "資訊"),
    ("文本", "文字"),
    ("联网", "連網"),
    ("网络", "網路"),
    ("网页", "網頁"),
    ("搜索", "搜尋"),
    ("搜索工具", "搜尋工具"),
    ("读取", "讀取"),
    ("读", "讀"),
    ("写入", "寫入"),
    ("写", "寫"),
    ("文件", "檔案"),
    ("目录", "目錄"),
    ("路径", "路徑"),
    ("模型", "模型"),
    ("工具调用", "工具呼叫"),
    ("工具结果", "工具結果"),
    ("工具产出", "工具產出"),
    ("工具", "工具"),
    ("调用", "呼叫"),
    ("执行", "執行"),
    ("运行", "執行"),
    ("命令", "命令"),
    ("任务", "任務"),
    ("计划", "計畫"),
    ("调研", "調查"),
    ("发现", "發現"),
    ("范围", "範圍"),
    ("项目", "專案"),
    ("结构", "結構"),
    ("状态", "狀態"),
    ("步骤", "步驟"),
    ("选择", "選擇"),
    ("确认", "確認"),
    ("澄清", "釐清"),
    ("问题", "問題"),
    ("内容", "內容"),
    ("标题", "標題"),
    ("简洁", "簡潔"),
    ("中文标题", "中文標題"),
    ("输出", "輸出"),
    ("输入", "輸入"),
    ("说明", "說明"),
    ("修改", "修改"),
    ("删除", "刪除"),
    ("保存", "儲存"),
    ("生成", "產生"),
    ("创建", "建立"),
    ("添加", "新增"),
    ("启用", "啟用"),
    ("关闭", "關閉"),
    ("返回", "回傳"),
    ("失败", "失敗"),
    ("错误", "錯誤"),
    ("为空", "為空"),
    ("后台", "背景"),
    ("供应商", "供應商"),
    ("密钥", "金鑰"),
    ("屏幕", "螢幕"),
    ("识别", "辨識"),
    ("翻译", "翻譯"),
    ("选中", "選取"),
    ("实时", "即時"),
    ("优先", "優先"),
    ("必须", "必須"),
    ("允许", "允許"),
    ("只读", "唯讀"),
    ("只输出", "只輸出"),
    ("不要输出", "不要輸出"),
    ("思考过程", "思考過程"),
    ("推理步骤", "推理步驟"),
    ("最终答案", "最終答案"),
    ("最终总结", "最終總結"),
    ("模型调用", "模型呼叫"),
    ("限流", "限流"),
    ("配额", "配額"),
    ("稍后", "稍後"),
    ("备用", "備用"),
    ("上下文", "上下文"),
    ("压缩", "壓縮"),
    ("审查", "審查"),
    ("重试", "重試"),
    ("更换", "更換"),
    ("已停止生成", "已停止產生"),
];

const S2T_CHAR_REPLACEMENTS: &[(char, char)] = &[
    ('与', '與'),
    ('为', '為'),
    ('个', '個'),
    ('这', '這'),
    ('该', '該'),
    ('将', '將'),
    ('会', '會'),
    ('时', '時'),
    ('后', '後'),
    ('里', '裡'),
    ('尽', '盡'),
    ('让', '讓'),
    ('请', '請'),
    ('从', '從'),
    ('对', '對'),
    ('发', '發'),
    ('开', '開'),
    ('关', '關'),
    ('长', '長'),
    ('实', '實'),
    ('现', '現'),
    ('边', '邊'),
    ('块', '塊'),
    ('数', '數'),
    ('据', '據'),
    ('库', '庫'),
    ('标', '標'),
    ('签', '籤'),
    ('类', '類'),
    ('层', '層'),
    ('无', '無'),
    ('项', '項'),
    ('则', '則'),
    ('历', '歷'),
    ('继', '繼'),
    ('续', '續'),
    ('确', '確'),
    ('认', '認'),
    ('换', '換'),
    ('应', '應'),
    ('错', '錯'),
    ('误', '誤'),
    ('帮', '幫'),
    ('档', '檔'),
    ('计', '計'),
    ('条', '條'),
    ('张', '張'),
    ('拟', '擬'),
    ('积', '積'),
    ('达', '達'),
    ('谈', '談'),
    ('转', '轉'),
    ('导', '導'),
    ('报', '報'),
    ('务', '務'),
    ('证', '證'),
    ('议', '議'),
    ('间', '間'),
    ('术', '術'),
    ('复', '複'),
    ('闭', '閉'),
    ('终', '終'),
    ('义', '義'),
    ('习', '習'),
    ('够', '夠'),
    ('变', '變'),
    ('动', '動'),
    ('汇', '匯'),
    ('总', '總'),
    ('寻', '尋'),
    ('问', '問'),
    ('识', '識'),
    ('约', '約'),
    ('联', '聯'),
    ('连', '連'),
    ('击', '擊'),
    ('见', '見'),
    ('专', '專'),
    ('参', '參'),
    ('须', '須'),
    ('断', '斷'),
    ('绝', '絕'),
    ('异', '異'),
    ('经', '經'),
    ('传', '傳'),
    ('构', '構'),
    ('预', '預'),
    ('热', '熱'),
    ('际', '際'),
    ('择', '擇'),
    ('随', '隨'),
    ('洁', '潔'),
    ('虑', '慮'),
    ('笔', '筆'),
    ('软', '軟'),
    ('输', '輸'),
    ('简', '簡'),
    ('试', '試'),
    ('载', '載'),
    ('损', '損'),
    ('删', '刪'),
    ('录', '錄'),
    ('码', '碼'),
    ('页', '頁'),
    ('临', '臨'),
    ('态', '態'),
    ('题', '題'),
    ('释', '釋'),
    ('线', '線'),
    ('备', '備'),
    ('额', '額'),
    ('内', '內'),
    ('体', '體'),
    ('并', '並'),
    ('声', '聲'),
    ('称', '稱'),
    ('记', '記'),
    ('忆', '憶'),
    ('写', '寫'),
    ('读', '讀'),
    ('网', '網'),
    ('搜', '搜'),
    ('页', '頁'),
    ('图', '圖'),
    ('吗', '嗎'),
    ('气', '氣'),
    ('质', '質'),
    ('检', '檢'),
    ('测', '測'),
    ('览', '覽'),
    ('权', '權'),
    ('删', '刪'),
    ('户', '戶'),
    ('单', '單'),
    ('双', '雙'),
    ('带', '帶'),
    ('处', '處'),
    ('滤', '濾'),
    ('链', '鏈'),
    ('显', '顯'),
    ('圆', '圓'),
    ('过', '過'),
    ('还', '還'),
    ('离', '離'),
    ('线', '線'),
    ('级', '級'),
    ('键', '鍵'),
    ('写', '寫'),
];

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn normalizes_legacy_language_codes() {
        assert_eq!(normalize_settings_language("zh"), "zh");
        assert_eq!(normalize_settings_language("zh-CN"), "zh");
        assert_eq!(normalize_settings_language("zh-TW"), "zh-TW");
        assert_eq!(normalize_settings_language("zh-Hant"), "zh-TW");
        assert_eq!(normalize_settings_language(""), "zh-TW");
        assert_eq!(normalize_settings_language("bogus"), "zh-TW");
        assert_eq!(normalize_model_language("zh-TW"), "zh-Hant");
        assert_eq!(try_normalize_model_language("bogus"), None);
        assert!(!is_chinese_language("ja"));
    }

    #[test]
    fn localizes_prompt_text_to_traditional_chinese() {
        let text = localized_zh_or_en(
            "zh-TW",
            "用户请求工具调用失败，请检查当前设置。",
            "Tool call failed.",
        );
        assert!(text.contains("使用者"));
        assert!(text.contains("工具呼叫"));
        assert!(text.contains("失敗"));
        assert!(text.contains("目前設定"));
    }

    #[test]
    fn localizes_common_default_prompt_words() {
        let text = localized_zh_or_en(
            "zh-TW",
            "可以帮用户写作、分析文档/数据、运行代码计算，回答清晰、有条理。",
            "",
        );
        assert!(text.contains("可以幫使用者寫作"));
        assert!(text.contains("文檔/數據"));
        assert!(text.contains("執行代碼計算"));
        assert!(text.contains("有條理"));
        assert!(!text.contains('帮'));
        assert!(!text.contains('档'));
        assert!(!text.contains('计'));
        assert!(!text.contains('条'));
    }
}
