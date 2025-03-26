import React from 'react'
import { AntDesignOutlined } from '@ant-design/icons'
import { Button, ConfigProvider, Space } from 'antd'
import { createStyles } from 'antd-style'

const useStyle = createStyles(({ prefixCls, css }) => ({
  linearGradientButton: css`
    &.${prefixCls}-btn-primary:not([disabled]):not(.${prefixCls}-btn-dangerous) {
      > span {
        position: relative;
      }

      &::before {
        content: '';
        background: linear-gradient(135deg, #6253e1, #04befe);
        position: absolute;
        inset: -1px;
        opacity: 1;
        transition: all 0.3s;
        border-radius: inherit;
      }

      &:hover::before {
        opacity: 0;
      }
    }
  `,
}))

const MakeComment = ({ open, setOpen }) => {
  const { styles } = useStyle()
  return (
    <ConfigProvider
      button={{
        className: styles.linearGradientButton,
      }}
    >
      <Space style={{ marginBottom: '1%' }}>
        <Button type='primary' size='large' icon={<AntDesignOutlined />} onClick={() => setOpen(true)}>
          make comment
        </Button>
      </Space>
    </ConfigProvider>
  )
}
export default MakeComment
