/**
 * Copyright (C) 2021 THL A29 Limited, a Tencent company.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import MenuBase from '@/toolbars/MenuBase';
import locale from '@/utils/locale';
import Event from '@/Event';

/**
 * 设置按钮
 */
export default class Settings extends MenuBase {
  /**
   * TODO: 需要优化参数传入方式
   * @param {Object} editor 编辑器实例
   * @param {Object} engine 引擎实例
   */
  constructor(editor, engine) {
    super(editor);
    this.setName('settings', 'settings');
    this.engine = engine;
    const classicBrIconName = this.engine.$cherry.options.engine.global.classicBr ? 'br' : 'normal';
    const previewIcon = editor.options.defaultModel === 'editOnly' ? 'preview' : 'previewClose';
    const previewName = editor.options.defaultModel === 'editOnly' ? 'togglePreview' : 'previewClose';
    this.instanceId = engine.$cherry.previewer.instanceId;
    this.subMenuConfig = [
      { iconName: classicBrIconName, name: 'classicBr', onclick: this.bindSubClick.bind(this, 'classicBr') },
      { iconName: previewIcon, name: previewName, onclick: this.bindSubClick.bind(this, 'previewClose') },
    ];
    this.attachEventListeners();
  }

  /**
   * 获取子菜单数组
   * @returns {Array} 返回子菜单
   */
  getSubMenuConfig() {
    return this.subMenuConfig;
  }

  /**
   * 监听快捷键，并触发回调
   * @param {string} shortCut 快捷键
   * @param {string} selection 编辑区选中的内容
   * @param {boolean} [async] 是否异步
   * @param {Function} [callback] 回调函数
   * @returns
   */
  bindSubClick(shortCut, selection, async, callback) {
    if (async) {
      return this.onClick(selection, shortCut, callback);
    }
    return this.onClick(selection, shortCut);
  }

  /**
   * 切换预览按钮
   * @param {boolean} isOpen 预览模式是否打开
   */
  togglePreviewBtn(isOpen) {
    const previewIcon = isOpen ? 'previewClose' : 'preview';
    const previewName = isOpen ? 'previewClose' : 'togglePreview';
    if (this.subMenu) {
      const dropdown = document.querySelector('.cherry-dropdown[name="settings"]');
      if (dropdown) {
        const icon = /** @type {HTMLElement} */ (dropdown.querySelector('.ch-icon-previewClose,.ch-icon-preview'));
        icon.classList.toggle('ch-icon-previewClose');
        icon.classList.toggle('ch-icon-preview');
        icon.title = locale.zh_CN[previewName];
        icon.parentElement.innerHTML = icon.parentElement.innerHTML.replace(
          /<\/i>.+$/,
          `</i>${locale.zh_CN[previewName]}`,
        );
      }
    } else {
      this.subMenuConfig = this.subMenuConfig.map((item) => {
        if (item.iconName === 'previewClose' || item.iconName === 'preview') {
          return { iconName: previewIcon, name: previewName, onclick: this.bindSubClick.bind(this, 'previewClose') };
        }
        return item;
      });
    }
  }

  /**
   * 绑定预览事件
   */
  attachEventListeners() {
    Event.on(this.instanceId, Event.Events.previewerClose, () => {
      this.togglePreviewBtn(false);
    });
    Event.on(this.instanceId, Event.Events.previewerOpen, () => {
      this.togglePreviewBtn(true);
    });
  }

  /**
   * 响应点击事件
   * @param {string} selection 编辑区选中的内容
   * @param {string} shortKey 快捷键
   * @param {Function} [callback] 回调函数
   * @returns
   */
  onClick(selection, shortKey = '', callback) {
    if (shortKey === 'classicBr') {
      const [dom] = Array.from(this.subMenu.dom.children);
      if (dom.childNodes[1].textContent === locale.zh_CN.classicBr) {
        dom.children[0].setAttribute(
          'class',
          dom.children[0].getAttribute('class').replace('ch-icon-br', 'ch-icon-normal'),
        );
        this.engine.$cherry.options.engine.global.classicBr = false;
        this.engine.hookCenter.hookList.paragraph.forEach((item) => {
          item.classicBr = false;
        });
        dom.childNodes[1].textContent = locale.zh_CN.normalBr;
      } else {
        dom.children[0].setAttribute(
          'class',
          dom.children[0].getAttribute('class').replace('ch-icon-normal', 'ch-icon-br'),
        );
        this.engine.$cherry.options.engine.global.classicBr = true;
        this.engine.hookCenter.hookList.paragraph.forEach((item) => {
          item.classicBr = true;
        });
        dom.childNodes[1].textContent = locale.zh_CN.classicBr;
      }
      this.engine.$cherry.previewer.update('');
      this.engine.$cherry.initText(this.engine.$cherry.editor.editor);
    } else if (shortKey === 'previewClose') {
      if (this.editor.previewer.isPreviewerHidden()) {
        this.editor.previewer.recoverPreviewer(true);
      } else {
        this.editor.previewer.editOnly(true);
      }
    }
    return selection;
  }
}
