import { supportLanguageList } from './lang';
import type {
  TextTranslate,TextTranslateQuery
} from "@bob-translate/types";
import { _bigmodelTranslate } from './translate';
import * as anki from './anki';


// 使用 bob 实现的 require 方法加载本地库,
var formatString = require('./libs/human-string');


// https://ripperhe.gitee.io/bob/#/plugin/quickstart/translate
export const  translate: TextTranslate = (query: TextTranslateQuery) => {
  const { text = '', detectFrom, detectTo } = query;
  const {
    token,
    savePath
  } = $option;

  const str = formatString(text);
  const params = { from: detectFrom, to: detectTo, token: token };
  $log.info(JSON.stringify(params));
  // 翻译
  let res = _bigmodelTranslate(str, params);
  res
    .then((result) => {
      $log.info("result");
      $log.info(JSON.stringify(result));
      query.onCompletion({
        result: {
        from: detectFrom,
        to: detectTo,
        toParagraphs: result.toParagraphs,
      }})
      return result
    })
    .then((translateResult) => {
      $log.info("translateResult");
      $log.info(JSON.stringify(translateResult));
      // 查询anki是否已经有翻译结果
      anki.findNote(text)
        .then((res) => {
          if (res) {
            $log.info('已经存在翻译结果');
          } else {
            // 保存到anki
            anki.save(str, translateResult.toParagraphs[0]);
          }
        })
        .catch((error) => {
          // anki 没打开的异常
          $log.info("catch 1");
          $log.info(JSON.stringify(error));
          $log.info(`savePath:${savePath}`);
          $log.info(`${str} ${translateResult.toParagraphs[0]}`);
          
          let existingContent = '';
          // 先读取现有内容
          if ($file.exists(`$sandbox/${savePath}`)) {
            const existingContentData = $file.read(`$sandbox/${savePath}`);
            $log.info("existingContent");
            existingContent = existingContentData.toUTF8();
            $log.info(existingContent);
          }
          
          // 准备要写入的内容
          const newContent = existingContent 
            ? `${existingContent}\n${str} ${translateResult.toParagraphs[0]}`
            : `${str} ${translateResult.toParagraphs[0]}`;
            
          const writeResult = $file.write({
            data: $data.fromUTF8(newContent),
            path: `$sandbox/${savePath}`
          });
          if (!writeResult) {
            $log.error("写入文件失败");
            return query.onCompletion({ error:{
              type:  "api",
              message: "写入文件失败",
              addition: "write file failed"
            }});
          }
          $log.info(JSON.stringify(writeResult));
          $log.info(`save success`);
          query.onCompletion({ result: translateResult });
        });
        query.onCompletion({ result: translateResult });
    })
    .catch((error) => {
      $log.error("catch 2");
      $log.error(JSON.stringify(error));
      if (error?.type) return query.onCompletion({ error });
      query.onCompletion({ error:{
        type:  "api",
        message: error.message || "Unknown OpenAI API error",
        addition: error.type,
      }});
    })
}

export const pluginTimeoutInterval = () => 60;

export const supportLanguages = () => supportLanguageList.map(([standardLang]) => standardLang);



