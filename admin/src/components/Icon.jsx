import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMoon, faSun, faList, faGauge, faRightFromBracket, faMagnifyingGlass, faXmark, faHouse, faGlobe, faCircleQuestion, faChevronLeft, faChevronRight, faChevronDown, faAngleRight, faBars, faSort, faSortUp, faSortDown, faUser, faUsers, faExpand, faCompress, faPlus } from '@fortawesome/free-solid-svg-icons'

// 图标集中封装，便于按需管理
export const icons = {
  moon: faMoon,
  sun: faSun,
  list: faList,
  bars: faBars,
  gauge: faGauge,
  logout: faRightFromBracket,
  search: faMagnifyingGlass,
  close: faXmark,
  home: faHouse,
  globe: faGlobe,
  question: faCircleQuestion,
  chevronLeft: faChevronLeft,
  chevronRight: faChevronRight,
  chevronDown: faChevronDown,
  angleRight: faAngleRight,
  sort: faSort,
  sortUp: faSortUp,
  sortDown: faSortDown,
  user: faUser,
  users: faUsers,
  expand: faExpand,
  compress: faCompress,
  plus: faPlus,
}

export default function Icon({ name, className }) {
  const icon = icons[name]
  if (!icon) return null
  return <FontAwesomeIcon icon={icon} className={className} />
}
