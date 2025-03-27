// импортируем енв переменные
/// <reference path="../vite-env.d.ts" />
import React, { useState, useEffect } from 'react'
import { DownloadOutlined } from '@ant-design/icons'
import { Button, Form, Input, Upload, Modal, Typography } from 'antd'
import ReCAPTCHA from 'react-google-recaptcha'
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

  const sanitizeComment = (comment: string) => {
    const allowedTags = {
      a: ['href', 'title'],
      code: [],
      i: [],
      strong: [],
    }

    // создаем временный div для парсинга HTML
    const div = document.createElement('div')
    div.innerHTML = comment

    // Удаляем все теги, кроме разрешенных
    const clean = (node: HTMLElement) => {
      Array.from(node.children).forEach(child => {
        const htmlChild = child as HTMLElement
        if (!(htmlChild.tagName.toLowerCase() in allowedTags)) {
          htmlChild.outerHTML = htmlChild.textContent || ''
        } else {
          const allowedAttrs = allowedTags[htmlChild.tagName.toLowerCase()]
          Array.from(htmlChild.attributes).forEach(attr => {
            if (!allowedAttrs.includes(attr.name)) {
              htmlChild.removeAttribute(attr.name)
            }
          })
          clean(htmlChild)
        }
      })
    }

    clean(div)
    return div.innerHTML
  }

  const validateHtml = (comment: string): boolean => {
    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(`<!DOCTYPE html><body>${comment}</body>`, 'text/html')
      const parseError = doc.querySelector('parsererror')

      if (parseError) {
        setError('Invalid HTML: tags must be properly closed')
        return false
      }

      const div = document.createElement('div')
      div.innerHTML = comment

      const allTags = Array.from(div.getElementsByTagName('*'))
      const allowedTagNames = ['a', 'code', 'i', 'strong']

      for (const element of allTags) {
        const tagName = element.tagName.toLowerCase()
        if (!allowedTagNames.includes(tagName)) {
          setError(`Tag <${tagName}> is not allowed. Only <a>, <code>, <i>, and <strong> tags are allowed.`)
          return false
        }

        if (tagName === 'a') {
          const attributes = Array.from(element.attributes)
          for (const attr of attributes) {
            if (!['href', 'title'].includes(attr.name)) {
              setError(`Attribute "${attr.name}" is not allowed in <a> tag. Only "href" and "title" are allowed.`)
              return false
            }
          }
        }
      }

      return true
    } catch (e) {
      console.error('HTML validation error:', e)
      setError('Invalid HTML structure')
      return false
    }
  }

  const beforeUpload = file => {
    const isJpgOrPngOrGif = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/gif'
    const isText = file.type === 'text/plain'

    if (!isJpgOrPngOrGif && !isText) {
      setError('You can only upload JPG/PNG/GIF image files or TXT files!')
      return false
    }

    if (isText && file.size > 102400) {
      setError('Text file must be smaller than 100KB!')
      return false
    }

    setError('')
    return true
  }

  // Поля для валидации
  const validationRules = {
    email: [
      { required: true, message: 'Please enter your email' },
      { type: 'email' as const, message: 'Please enter a valid email address' },
      { max: 255, message: 'Email must be less than 255 characters' },
    ],
    nickname: [
      { required: true, message: 'Please enter your nickname' },
      { min: 2, message: 'Nickname must be at least 2 characters' },
      { max: 50, message: 'Nickname must be less than 50 characters' },
      { pattern: /^[a-zA-Z0-9_-]+$/, message: 'Nickname can only contain letters, numbers, underscores and dashes' },
    ],
    homepage: [
      { type: 'url' as const, message: 'Please enter a valid URL' },
      { max: 255, message: 'Homepage URL must be less than 255 characters' },
    ],
    comment: [
      { required: true, message: 'Please enter your comment' },
      { min: 3, message: 'Comment must be at least 3 characters' },
      { max: 3000, message: 'Comment must be less than 3000 characters' },
    ],
  }

  const onFinish = async (values: {
    email?: string
    nickname?: string
    comment?: string
    homepage?: string
    upload?: any
  }) => {
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

    if (!validateHtml(values.comment)) {
      return
    }

    try {
      const sanitizedComment = sanitizeComment(values.comment)
      const file = values.upload?.[0]?.originFileObj

      const operations = {
        query: `
          mutation CreateComment(
            $text: String!, 
            $email: String!, 
            $nickname: String!, 
            $parentId: ID, 
            $homePage: String, 
            $file: Upload
          ) {
            createComment(
              text: $text
              email: $email
              nickname: $nickname
              parentId: $parentId
              homePage: $homePage
              file: $file
            ) {
              id
              userId
              homePage
              text
              parentId
              filePath
              createdAt
              user {
                email
                nickname
              }
            }
          }
        `,
        variables: {
          text: sanitizedComment,
          email: values.email,
          nickname: values.nickname,
          homePage: values.homepage || null,
          parentId: selectedCommentId || null,
          file: null, // потом будет заменен на фактический файл
        },
      }

      const formData = new FormData()
      formData.append('operations', JSON.stringify(operations))

      const map = {}
      if (file) {
        map['0'] = ['variables.file']
        formData.append('map', JSON.stringify(map))
        formData.append('0', file)
      } else {
        formData.append('map', '{}')
      }

      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/graphql`, formData, {
        headers: {
          'Apollo-Require-Preflight': 'true',
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
      console.error('Upload error:', exception)
      setError('Error uploading file or creating comment')
    }
  }

  console.log(import.meta.env.VITE_CAPTCHA_SECRET)

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
          <Form.Item name='email' label='Email' rules={validationRules.email} hasFeedback>
            <Input placeholder='Enter your email' id='email' />
          </Form.Item>

          <Form.Item name='nickname' label='Nickname' rules={validationRules.nickname} hasFeedback>
            <Input placeholder='Enter your nickname' id='nickname' />
          </Form.Item>

          <Form.Item name='homepage' label='Homepage' rules={validationRules.homepage}>
            <Input placeholder='https://example.com' id='homepage' />
          </Form.Item>

          <Form.Item
            name='comment'
            label='Comment'
            id='comment'
            hasFeedback
            help={
              <Text type='secondary'>
                Allowed HTML tags:
                <code>&lt;a href="" title=""&gt;</code>,<code>&lt;code&gt;</code>,<code>&lt;i&gt;</code>,
                <code>&lt;strong&gt;</code>
              </Text>
            }
            rules={validationRules.comment}
          >
            <Input.TextArea allowClear showCount maxLength={3000} />
          </Form.Item>

          <Form.Item label='Upload' name='upload' valuePropName='fileList' getValueFromEvent={normFile}>
            <Upload
              beforeUpload={beforeUpload}
              maxCount={1}
              accept='.jpg,.jpeg,.png,.gif,.txt'
              listType='picture'
              customRequest={({ onSuccess }) => {
                if (onSuccess) onSuccess('ok')
              }}
            >
              <Button icon={<DownloadOutlined />}>Upload File (JPG/PNG/GIF/TXT)</Button>
            </Upload>
          </Form.Item>

          <Form.Item label='Captcha' required={true}>
            <ReCAPTCHA sitekey='6LdckQIkAAAAAIti_aaT_fPhD3knm7R3qyfeysc8' />
          </Form.Item>

          {form.getFieldValue('upload')?.[0]?.originFileObj && (
            <div style={{ marginBottom: '16px' }}>
              {form.getFieldValue('upload')?.[0]?.type?.match(/^image\/(jpeg|png|gif)$/i) ? (
                <img
                  src={URL.createObjectURL(form.getFieldValue('upload')[0].originFileObj)}
                  alt='Preview'
                  style={{ maxWidth: '320px', maxHeight: '240px' }}
                />
              ) : (
                <a href={URL.createObjectURL(form.getFieldValue('upload')[0].originFileObj)} download>
                  Download preview
                </a>
              )}
            </div>
          )}

          <Text type='secondary' style={{ display: 'block', marginBottom: '10px' }}>
            Supported files: Images (JPG, PNG, GIF - max 320x240px) or Text (TXT - max 100KB)
          </Text>

          <Text type='danger'>{error}</Text>
        </Form>
      </Modal>
    </>
  )
}
export default CreateCommentModal
