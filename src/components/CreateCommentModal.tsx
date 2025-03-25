import React, { useState, useEffect } from 'react'
import { DownloadOutlined } from '@ant-design/icons'
import { Button, Form, Input, Upload, Modal, Typography } from 'antd'
// import ReCAPTCHA from 'react-google-recaptcha'
import axios from 'axios'

const { Text } = Typography

const formItemLayout = {
  labelCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 6,
    },
  },
  wrapperCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 14,
    },
  },
}
const CreateCommentModal = ({ open, setOpen, handleCancel, selectedCommentId }) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setError('')
  }, [open])

  const normFile = e => {
    if (Array.isArray(e)) {
      return e
    }
    return e?.fileList
  }

  const onFinish = async (values: {
    email?: string
    nickname?: string
    comment?: string
    homepage?: string
    upload?: any
  }) => {
    console.log(values)
    if (!values.email || !values.nickname || !values.comment) {
      setError('Please fill in all fields')
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const checkEmail = emailRegex.test(values.email)
    if (!checkEmail) {
      setError('Please enter a valid email address')
      return
    }

    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}`, {
        query: `
          mutation($text: String!, $email: String!, $nickname: String!, $homePage: String, $parentId: ID) {
            createComment(text: $text, email: $email, nickname: $nickname, homePage: $homePage, parentId: $parentId) {
              id
              userId
              homePage
              text
              parentId
              createdAt
              user {
                email
                nickname
              }
            }
          }
        `,
        variables: {
          text: values.comment,
          email: values.email,
          nickname: values.nickname,
          homePage: values.homepage,
          parentId: selectedCommentId,
        },
      })

      const { data, errors } = response.data

      if (errors) {
        setError(errors[0].message)
        return
      }

      if (data.createComment) {
        setLoading(true)
        setTimeout(() => {
          setLoading(false)
          setOpen(false)
          form.resetFields()
        }, 1000)
      }
    } catch (exception) {
      console.log(exception)
    }
  }

  return (
    <>
      <Modal
        open={open}
        title='Comment'
        onCancel={handleCancel}
        footer={[
          <Button key='back' onClick={handleCancel}>
            Return
          </Button>,
          <Button key='submit' type='primary' loading={loading} onClick={() => form.submit()}>
            Submit
          </Button>,
        ]}
      >
        <Form
          {...formItemLayout}
          style={{
            maxWidth: 600,
          }}
          form={form}
          onFinish={onFinish}
        >
          <Form.Item
            name='email'
            label='Email'
            rules={[{ required: true, message: 'Please enter your email' }]}
            hasFeedback
          >
            <Input placeholder='Enter your email' id='email' />
          </Form.Item>

          <Form.Item
            name='nickname'
            label='Nickname'
            rules={[{ required: true, message: 'Please enter your nickname' }]}
            hasFeedback
          >
            <Input placeholder='Enter your nickname' id='nickname' />
          </Form.Item>

          <Form.Item name='homepage' label='Homepage'>
            <Input placeholder='' id='homepage' />
          </Form.Item>

          <Form.Item
            name='comment'
            label='Comment'
            id='comment'
            hasFeedback
            help='Type comment here'
            rules={[{ required: true, message: 'Please enter your email' }]}
          >
            <Input.TextArea allowClear showCount />
          </Form.Item>

          <Form.Item label='Upload' name='upload' id='upload' valuePropName='fileList' getValueFromEvent={normFile}>
            <Upload action='/upload.do'>
              <Button type='primary' icon={<DownloadOutlined />} size={'middle'} />
            </Upload>
          </Form.Item>

          {/* <Form.Item label='Captcha' required={true}>
            <ReCAPTCHA sitekey='6LdckQIkAAAAAIti_aaT_fPhD3knm7R3qyfeysc8' />
          </Form.Item> */}

          <Text type='danger'>{error}</Text>
        </Form>
      </Modal>
    </>
  )
}
export default CreateCommentModal
