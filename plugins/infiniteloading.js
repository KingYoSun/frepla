import Vue from 'vue'
import InfiniteLoading from 'vue-infinite-loading'

Vue.use(InfiniteLoading, {
  slots: {
    noMore: 'データ読み込み完了'
  }
})

Vue.component('infinite-loading', InfiniteLoading)