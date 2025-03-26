import React, { useState, useEffect } from 'react'
import { DeleteOutlined, MessageOutlined } from '@ant-design/icons'
import { Avatar, Button, List, Popover, Space, Input } from 'antd'
import axios from 'axios'
import CreateCommentModal from './CreateCommentModal'
import MakeComment from './FirstComment'

const IconText = ({ icon, text }) => (
  <Space>
    {React.createElement(icon)}
    {text}
  </Space>
)

const CommentList = () => {
  const [comments, setComments] = useState([])
  const [open, setOpen] = useState(false)
  const [selectedCommentId, setSelectedCommentId] = useState(null)
  const [total, setTotal] = useState(0)
  const [sortOrder, setSortOrder] = useState('desc')
  const [searchText, setSearchText] = useState('')
  const [sortField, setSortField] = useState('createdAt')
  const [offset, setOffset] = useState(0)
  const limit = 25

  const formatDate = dateString => {
    const timestamp = dateString.toString().length === 10 ? dateString * 1000 : parseInt(dateString)

    const date = new Date(timestamp)
    return date
      .toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
      .replace(',', ' в')
  }

  const fetchComments = async () => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}`, {
        query: `
          query getComments($limit: Int, $orderBy: String, $order: String, $offset: Int) {
            getComments(limit: $limit, orderBy: $orderBy, order: $order, offset: $offset) {
              comments {
                id
                homePage
                text
                filePath
                createdAt
                user {
                  email
                  nickname
                }
                children {
                  id
                  homePage
                  text
                  filePath
                  createdAt
                  user {
                    nickname
                    email
                  }
                  children {
                    homePage
                    filePath
                    id
                    text
                    createdAt
                    user {
                      email
                      nickname
                    }
                    children {
                      homePage
                      id
                      text
                      filePath
                      createdAt
                      user {
                        email
                        nickname
                      }
                    }
                  }
                }
              }
              total
            }
          }
        `,
        variables: {
          limit,
          orderBy: sortField,
          order: sortOrder,
          offset,
        },
      })

      const { data, errors } = response.data
      if (errors) {
        console.error(errors)
      }
      if (data.getComments) {
        const commentTree = data.getComments.comments.map((comment, i) => ({
          id: comment.id,
          title: `${comment.user.nickname}: ${comment.user.email}:  ${formatDate(comment.createdAt)}`,
          avatar: `https://api.dicebear.com/7.x/miniavs/svg?seed=${i}`,
          description: comment.homePage,
          content: comment.text,
          filePath: comment.filePath,
          children: comment.children.map((child, j) => ({
            id: child.id,
            title: `${child.user.nickname}: ${child.user.email} ${formatDate(child.createdAt)}`,
            avatar: `https://api.dicebear.com/7.x/miniavs/svg?seed=${i}-${j}`,
            description: child.homePage,
            content: child.text,
            filePath: child.filePath,
            children: child.children.map((grandChild, k) => ({
              id: grandChild.id,
              title: `${grandChild.user.nickname}: ${grandChild.user.email} ${formatDate(grandChild.createdAt)}`,
              avatar: `https://api.dicebear.com/7.x/miniavs/svg?seed=${i}-${j}-${k}`,
              description: grandChild.homePage,
              content: grandChild.text,
              filePath: grandChild.filePath,
              children: grandChild.children.map((greatGrandChild, l) => ({
                id: greatGrandChild.id,
                title: `${greatGrandChild.user.nickname}: ${greatGrandChild.user.email} ${formatDate(
                  greatGrandChild.createdAt,
                )}`,
                avatar: `https://api.dicebear.com/7.x/miniavs/svg?seed=${i}-${j}-${k}-${l}`,
                description: greatGrandChild.homePage,
                content: greatGrandChild.text,
                filePath: greatGrandChild.filePath,
                children: [],
              })),
            })),
          })),
        }))
        setComments(commentTree)
      }
      if (data.getComments.total) {
        setTotal(data.getComments.total)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const searchComments = async (query, offset = 0) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}`, {
        query: `
          query searchComments($query: String!, $limit: Int, $offset: Int) {
            searchComments(query: $query, limit: $limit, offset: $offset) {
              comments {
                id
                homePage
                text
                filePath
                createdAt
                user {
                  email
                  nickname
                }
                children {
                  id
                  homePage
                  text
                  filePath
                  createdAt
                  user {
                    nickname
                    email
                  }
                  children {
                    id
                    homePage
                    text
                    filePath
                    createdAt
                    user {
                      email
                      nickname
                    }
                    children {
                      id
                      homePage
                      text
                      filePath
                      createdAt
                      user {
                        email
                        nickname
                      }
                    }
                  }
                }
              }
              total
            }
          }
        `,
        variables: {
          query,
          limit,
          offset,
        },
      })

      const { data, errors } = response.data
      if (errors) {
        console.error(errors)
      }
      if (data.searchComments) {
        const commentTree = data.searchComments.comments.map((comment, i) => ({
          id: comment.id,
          title: `${comment.user.nickname}: ${comment.user.email} ${formatDate(comment.createdAt)}`,
          avatar: `https://api.dicebear.com/7.x/miniavs/svg?seed=${i}`,
          description: comment.homePage,
          content: comment.text,
          filePath: comment.filePath,
          children: comment.children.map((child, j) => ({
            id: child.id,
            title: `${child.user.nickname}: ${child.user.email} ${formatDate(child.createdAt)}`,
            avatar: `https://api.dicebear.com/7.x/miniavs/svg?seed=${i}-${j}`,
            description: child.homePage,
            content: child.text,
            filePath: child.filePath,
            children: child.children.map((grandChild, k) => ({
              id: grandChild.id,
              title: `${grandChild.user.nickname}: ${grandChild.user.email} ${formatDate(grandChild.createdAt)}`,
              avatar: `https://api.dicebear.com/7.x/miniavs/svg?seed=${i}-${j}-${k}`,
              description: grandChild.homePage,
              content: grandChild.text,
              filePath: grandChild.filePath,
              children: grandChild.children.map((greatGrandChild, l) => ({
                id: greatGrandChild.id,
                title: `${greatGrandChild.user.nickname}: ${greatGrandChild.user.email} ${formatDate(
                  greatGrandChild.createdAt,
                )}`,
                avatar: `https://api.dicebear.com/7.x/miniavs/svg?seed=${i}-${j}-${k}-${l}`,
                description: greatGrandChild.homePage,
                content: greatGrandChild.text,
                filePath: greatGrandChild.filePath,
                children: [],
              })),
            })),
          })),
        }))
        setComments(commentTree)
        setTotal(data.searchComments.total)
      }
    } catch (error) {
      console.error('Search error:', error)
    }
  }

  useEffect(() => {
    if (!open) {
      if (searchText) {
        searchComments(searchText, offset)
      } else {
        fetchComments()
      }
    }
  }, [open, sortField, sortOrder, offset, limit, searchText])

  const showModal = comment => {
    setSelectedCommentId(comment.id)
    setOpen(true)
  }

  const handleCancel = () => {
    setOpen(false)
  }

  const deleteComment = async id => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}`, {
        query: `
          mutation($id: ID!) {
            deleteComment(id: $id)
          }
        `,
        variables: {
          id,
        },
      })
      const { data, errors } = response.data
      if (errors) {
        console.error(errors)
      }
      if (data.deleteComment) {
        fetchComments()
      }
    } catch (error) {
      console.error(error)
    }
  }

  const renderComment = (item, level = 0) => {
    const baseColor = '#f0f2f5'
    const backgroundColor = level === 0 ? baseColor : `hsl(${level * 5}, 33%, ${95 - level * 2}%)`

    const renderFile = filePath => {
      const fileExtension = filePath.split('.').pop().toLowerCase()
      const isImage = ['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(fileExtension)
      const fileUrl = `http://localhost:3010/${filePath}`

      if (isImage) {
        return (
          <img
            src={fileUrl}
            alt='Attached file'
            style={{
              maxWidth: '200px',
              maxHeight: '200px',
              objectFit: 'contain',
              float: 'right',
              margin: '0 0 10px 10px',
            }}
            onError={e => console.error('Image loading error:', e)}
          />
        )
      } else {
        return (
          <a
            href={fileUrl}
            target='_blank'
            rel='noopener noreferrer'
            style={{
              float: 'right',
              margin: '0 0 10px 10px',
            }}
          >
            Download file
          </a>
        )
      }
    }

    return (
      <List.Item
        key={item.id}
        style={{
          marginLeft: level * 40,
          width: `calc(100% - ${level * 40}px)`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          marginBottom: '16px',
          padding: '16px',
          backgroundColor,
          borderRadius: '8px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
          }}
        >
          <div style={{ flex: 1, marginBottom: '12px' }}>
            {item.filePath && <div style={{ position: 'relative', zIndex: 1 }}>{renderFile(item.filePath)}</div>}
            <List.Item.Meta avatar={<Avatar src={item.avatar} />} title={item.title} description={item.description} />
            <div style={{ marginTop: '8px' }} dangerouslySetInnerHTML={{ __html: item.content }} />
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '8px',
            }}
          >
            <Popover placement='top' title={'delete comment'}>
              <Button onClick={() => deleteComment(item.id)}>
                <IconText icon={DeleteOutlined} key='list-vertical-like-o' />
              </Button>
            </Popover>
            <Popover placement='top' title={'comment'}>
              <Button onClick={() => showModal(item)}>
                <IconText icon={MessageOutlined} key='list-vertical-message' />
              </Button>
            </Popover>
          </div>
        </div>
        {item.children && item.children.length > 0 && (
          <List
            itemLayout='vertical'
            dataSource={item.children}
            renderItem={child => renderComment(child, level + 1)}
            style={{ width: '100%', marginTop: '16px' }}
          />
        )}
      </List.Item>
    )
  }

  const handleSortFieldChange = field => {
    setSortField(field)
    setOffset(0)
  }

  const handleSortOrderChange = order => {
    setSortOrder(order)
    setOffset(0)
  }

  return (
    <>
      <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div>
            <span style={{ marginRight: '8px', fontWeight: 'bold' }}>Sort by:</span>
            <Space.Compact>
              <Button
                type={sortField === 'createdAt' ? 'primary' : 'default'}
                onClick={() => handleSortFieldChange('createdAt')}
              >
                Date
              </Button>
              <Button
                type={sortField === 'nickname' ? 'primary' : 'default'}
                onClick={() => handleSortFieldChange('nickname')}
              >
                Nickname
              </Button>
              <Button
                type={sortField === 'email' ? 'primary' : 'default'}
                onClick={() => handleSortFieldChange('email')}
              >
                Email
              </Button>
            </Space.Compact>
          </div>

          <div>
            <span style={{ marginRight: '8px', fontWeight: 'bold' }}>Order:</span>
            <Space.Compact>
              <Button type={sortOrder === 'desc' ? 'primary' : 'default'} onClick={() => handleSortOrderChange('desc')}>
                Descending
              </Button>
              <Button type={sortOrder === 'asc' ? 'primary' : 'default'} onClick={() => handleSortOrderChange('asc')}>
                Ascending
              </Button>
            </Space.Compact>
          </div>
        </div>

        <Input.Search
          placeholder='Search comments...'
          allowClear
          style={{ maxWidth: 300 }}
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          onSearch={value => {
            if (value) {
              searchComments(value)
            } else {
              fetchComments()
            }
          }}
          enterButton
        />
      </div>
      <MakeComment open={open} setOpen={setOpen} />
      <List
        itemLayout='vertical'
        size='large'
        style={{ width: '100%' }}
        pagination={{
          onChange: page => {
            const newOffset = (page - 1) * limit
            setOffset(newOffset)
          },
          current: Math.floor(offset / limit) + 1,
          pageSize: limit,
          total,
        }}
        dataSource={comments}
        renderItem={item => renderComment(item)}
      />
      <CreateCommentModal
        open={open}
        setOpen={setOpen}
        handleCancel={handleCancel}
        selectedCommentId={selectedCommentId}
      />
    </>
  )
}
export default CommentList
