/** 门店分类 key（用联合类型而不是 enum，以兼容 erasableSyntaxOnly） */
export type CategoryKey =
  | 'benbang'
  | 'yuegang'
  | 'chuanxiang'
  | 'yungui'
  | 'beifang'
  | 'rihan'
  | 'western'

export interface CategoryMeta {
  key: CategoryKey
  label: string
  /** 地图标记 / 图例圆点使用的功能色 */
  color: string
}

/** 一家美食门店 */
export interface Restaurant {
  id: string
  /** 展示名（用大家平时叫的名字，短一点，方便在地图上做标签） */
  name: string
  category: CategoryKey
  /** GCJ-02 坐标（高德坐标系），来自高德站内数据 */
  lng: number
  lat: number
  /** 行政区，例如「黄浦」 */
  district: string
  address: string
  /** 人均（元），不确定就留空 */
  price?: number
  tags: string[]
  /** 一句话备注（招牌、人气、登记名差异等） */
  note: string
  /** 必点菜 */
  mustOrder: string[]
}
