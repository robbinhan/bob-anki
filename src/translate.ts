// import * as Bob from '@bob-plug/core';
import type {
  TextTranslateResult
} from "@bob-translate/types";
import { Language } from "@bob-translate/types/types/lang.type";
// import { ZhipuAI } from 'zhipuai-sdk-nodejs-v4';

interface QueryOption {
  to?: Language;
  from?: Language;
  token?: string;
}



async function _bigmodelTranslate(text: string, options: QueryOption = {}): Promise<TextTranslateResult> {
  const { from = 'auto', to = 'auto', token} = options;

  if (!token) {
    $log.error("token 不能为空");
    throw {
      type: 'api',
      message: 'token 不能为空',
      addition: 'token 不能为空'
    }
  }

  const result: TextTranslateResult = { from, to, toParagraphs: [] };

  try {
    const prompt = `${text}`

    const data = await $http.request({
      header: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      method: 'POST',
      url: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
      body: {
        model: 'glm-4-flash',
        temperature: 0.5,
        messages: [
          {"role": "system", "content": `
            You are an expert in both the source and target languages, with a deep understanding of their respective cultures.
            ## Translation Requirements: 
              1.Stay true to the "Source Text," ensuring each sentence is translated accurately and fluently. 
              2.Ensure that no part of the text is omitted during translation. Every detail must be included. 
              3.Large numbers must be translated correctly, following Simplified Chinese onventions. 
            ## Instruction: 
              1.Carefully analyze and deeply understand the content, context, emotions, and cultural nuances of the "Source Text" in relation to the target language. 
              2.Translate the "Source Text" into ${to} accurately according to the "Translation Requirements." 
              3.Ensure the translation is accurate, natural, and fluent for the target audience. Adjust expressions as necessary to fit cultural and linguistic norms. 
            ## Requirements: 
              Do not include any additional content. Only output the translation. This is crucial. 
     `},
          {"role": "user", "content": prompt}
        ],
        stream: false, 
      }
    })

    $log.info(JSON.stringify(data));

    data.data.choices.forEach((item: any) => {
      if (item.message.role == "assistant") {
        result.toParagraphs.push(item.message.content);
      }
    })

    // 在此处实现翻译的具体处理逻辑
    // result.toParagraphs = [text];
    result.raw = data;

    return result;
  } catch (error) {
    throw {
      type: 'api',
      message: '数据解析错误出错',
      addition: error
    }
  }
}

export {_bigmodelTranslate };
