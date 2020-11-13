<template>
  <div class="ueditor">
    <vue-ueditor-wrap
      v-model="content"
      :config="myConfig"
      @beforeInit="addCustomButtom"
    ></vue-ueditor-wrap>
    <div>
      <el-dialog
        v-loading="loading"
        element-loading-text="拼命加载中"
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(0, 0, 0, 0.8)"
        title="图片上传"
        :visible.sync="dialogVisible"
        width="500px"
        zIndex="2001"
        :lock-scroll="true"
        :close-on-click-modal="false"
        :fullscreen="false"
        :modal="false"
      >
        <div class="image-upload-panel" style="position: relative">
          <div class="image-item" v-for="(item, index) in imageList" :key="index">
            <img :src="item.url" />
            <span class="image-del el-icon-close" @click="delImage(index)"></span>
          </div>
          <el-upload
            class="image-upload-btn"
            :action="fileAction"
            :data="uploadObj"
            accept="image/jpg"
            name="file"
            :before-upload="beforeAvatarUpload"
            with-credentials
            :show-file-list="false"
            :on-success="imageUploadSuccess"

          >
            <i class="el-icon-plus"></i>
          </el-upload>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button
            @click="
              () => {
                this.dialogVisible = false;
              }
            "
          >取 消</el-button
          >
          <el-button type="primary" @click="insertImage">确 定</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import VueUeditorWrap from 'vue-ueditor-wrap';
import { getToken } from '@/utils/auth';
export default {
  components: {
    VueUeditorWrap
  },
  computed: {
    fileAction () {
      return process.env.VUE_APP_IMAGE_BASE_URL + '/admin/upyun/upload';
    }
  },
  props: {
    value: {
      type: String,
      default: ''
    },
    myConfig: {
      type: Object,
      default: () => ({
        // 编辑器不自动被内容撑高
        autoHeightEnabled: false,
        // 初始容器高度
        initialFrameHeight: 400,
        maximumWords: 30000,
        // 初始容器宽度
        initialFrameWidth: '100%',
        zIndex: 2000,
        // UEditor 资源文件的存放路径，如果你使用的是 vue-cli 生成的项目，通常不需要设置该选项，vue-ueditor-wrap 会自动处理常见的情况，如果需要特殊配置，参考下方的常见问题2
        UEDITOR_HOME_URL: '/UEditor/'
      })
    }
  },
  data () {
    return {
      uploadObj: {
        file: 'name',
        'Content-Type': 'multipart/form-data',
        token: getToken()
      },
      loading: undefined,
      dialogVisible: false,
      imageList: [],
      editorHandler: null,
      content: this.value
    };
  },
  methods: {
    // 删除图片
    delImage (index) {
      let imageList = this.imageList;
      imageList.splice(index, 1);
    },
    // 图片开始上传
    imageBeforeUpload (file) {
      this.loading = true;
    },
    // 图片上传成功
    imageUploadSuccess (response, file) {
      this.loading = false;
      let imageList = this.imageList;
      let item = { url: response.data };
      imageList.push(item);
      this.imageList = imageList;
    },
    insertImage () {
      let imageList = this.imageList;
      let imageHtml = '';
      (imageList || []).map(item => {
        imageHtml = imageHtml + '<p><img src="' + item.url + '"/></p>';
      });
      if (imageHtml != '') {
        this.editorHandler.execCommand('inserthtml', imageHtml);
      }
      this.dialogVisible = false;
    },
    addCustomButtom (editorId) {
      const that = this;
      this.$notify({
        title: '提示',
        type: 'warning',
        dangerouslyUseHTMLString: true,
        message: '富文本上传图片大小为<strong>2M</strong>以内, 格式为<strong>.jpg</strong>',
        duration: 2000
      });
      window.UE.registerUI(
        'test-button',
        function (editor, uiName) {
          // 注册按钮执行时的 command 命令，使用命令默认就会带有回退操作
          editor.registerCommand(uiName, {
            execCommand: () => {
              that.imageList = [];
              that.dialogVisible = true;
              that.editorHandler = editor;
              // editor.execCommand('inserthtml', `<span>这是一段由自定义按钮添加的文字</span>`)
            }
          });

          // 创建一个 button
          var btn = new window.UE.ui.Button({
            // 按钮的名字
            name: uiName,
            // 提示
            title: '上传图片',
            // 需要添加的额外样式，可指定 icon 图标，图标路径参考常见问题 2
            cssRules: 'background-position: -380px 0;',
            // 点击时执行的命令
            onclick: function () {
              // 这里可以不用执行命令，做你自己的操作也可
              editor.execCommand(uiName);
            }
          });

          // 当点到编辑内容上时，按钮要做的状态反射
          editor.addListener('selectionchange', function () {
            var state = editor.queryCommandState(uiName);
            if (state === -1) {
              btn.setDisabled(true);
              btn.setChecked(false);
            } else {
              btn.setDisabled(false);
              btn.setChecked(state);
            }
          });

          // 因为你是添加 button，所以需要返回这个 button
          return btn;
        },
        47 /* 指定添加到工具栏上的哪个位置，默认时追加到最后 */,
        editorId /* 指定这个 UI 是哪个编辑器实例上的，默认是页面上所有的编辑器都会添加这个按钮 */
      );
    },
    beforeAvatarUpload (file) {
      const isJPG = file.type === 'image/jpeg';
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isJPG) {
        this.$message.error('上传图片只能是 JPG 格式!');
      }
      if (!isLt2M) {
        this.$message.error('上传图片大小不能超过 2MB!');
      }
      if(isJPG && isLt2M) {
        this.loading = true;
      }
      return isJPG && isLt2M;
    }
  },
  watch: {
    value (newValue) {
      this.content = newValue;
    },
    content (newValue) {
      this.$emit('input', newValue);
    }
  }
};
</script>
<style scoped>
.image-upload-panel {
  overflow: hidden;
}
.image-upload-btn {
  float: left;
  width: 150px;
  height: 150px;
  border: 1px dashed #c0ccda;
  border-radius: 6px;
  line-height: 150px;
  text-align: center;
}

.image-upload-btn div {
  width: 150px;
}

.image-upload-btn i {
  font-size: 30px;
  font-weight: 400;
}
.image-item {
  float: left;
  width: 150px;
  height: 150px;
  background: #ddd;
  margin-right: 10px;
  border-radius: 6px;
  position: relative;
}
.image-item img {
  max-width: 150px;
  border-radius: 6px;
}
.image-del {
  position: absolute;
  top: 0px;
  right: 0px;
  color: red;
  font-weight: bold;
  font-size: 20px;
  cursor: pointer;
}
.el-form-item__content .ueditor {
  line-height: 28px;
}
</style>
