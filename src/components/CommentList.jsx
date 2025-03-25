import React, { useState, useEffect } from 'react'
import { DeleteOutlined, MessageOutlined } from '@ant-design/icons'
import { Avatar, Button, List, Popover, Space, Modal, Input } from 'antd'
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

  const fetchComments = async ({ limit = 2, orderBy = 'createdAt', order = 'desc', offset = 0 } = {}) => {
    console.log('fetching comments', limit, orderBy, order, offset)
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}`, {
        query: `
          query getComments($limit: Int, $orderBy: String, $order: String, $offset: Int) {
            getComments(limit: $limit, orderBy: $orderBy, order: $order, offset: $offset) {
              comments {
                id
              homePage
              text
              parentId
              user {
                email
                nickname
                createdAt
              }
              children {
                id
                homePage
                text
                parentId
                user {
                  nickname
                }
                children {
                  homePage
                  id
                  text
                  parentId
                  user {
                    email
                  }
                  children {
                    homePage
                    id
                    text
                    user {
                      email
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
          orderBy,
          order,
          offset,
        },
      })

      const { data, errors } = response.data
      if (errors) {
        console.error(errors)
      }
      if (data.getComments) {
        console.log(data.getComments.comments)
        const commentTree = data.getComments.comments.map((comment, i) => ({
          id: comment.id,
          title: `${comment.user.nickname}: ${comment.user.email}`,
          avatar: `https://api.dicebear.com/7.x/miniavs/svg?seed=${i}`,
          description: comment.homePage,
          content: comment.text,
          children: comment.children.map((child, j) => ({
            id: child.id,
            title: `${child.user.nickname}`,
            avatar: `https://api.dicebear.com/7.x/miniavs/svg?seed=${i}-${j}`,
            description: child.homePage,
            content: child.text,
            children: child.children.map((grandChild, k) => ({
              id: grandChild.id,
              title: `${grandChild.user.email}`,
              avatar: `https://api.dicebear.com/7.x/miniavs/svg?seed=${i}-${j}-${k}`,
              description: grandChild.homePage,
              content: grandChild.text,
              children: grandChild.children.map((greatGrandChild, l) => ({
                id: greatGrandChild.id,
                title: `${greatGrandChild.user.email}`,
                avatar: `https://api.dicebear.com/7.x/miniavs/svg?seed=${i}-${j}-${k}-${l}`,
                description: greatGrandChild.homePage,
                content: greatGrandChild.text,
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

  useEffect(() => {
    if (!open) {
      fetchComments()
    }
  }, [open])

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
        console.log(data.deleteComment)
        fetchComments()
      }
    } catch (error) {
      console.error(error)
    }
  }

  const renderComment = (item, level = 0) => {
    const baseColor = '#f0f2f5'
    const backgroundColor = level === 0 ? baseColor : `hsl(${level * 5}, 33%, ${95 - level * 2}%)`

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
            <List.Item.Meta avatar={<Avatar src={item.avatar} />} title={item.title} description={item.description} />
            <div style={{ marginTop: '8px' }}>{item.content}</div>
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

  return (
    <>
      <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Sort Controls */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {/* Sort Field Selection */}
          <div>
            <span style={{ marginRight: '8px', fontWeight: 'bold' }}>Sort by:</span>
            <Button.Group>
              <Button
                type={sortField === 'createdAt' ? 'primary' : 'default'}
                onClick={() => {
                  setSortField('createdAt')
                  fetchComments({ orderBy: 'createdAt', order: sortOrder })
                }}
              >
                Date
              </Button>
              <Button
                type={sortField === 'nickname' ? 'primary' : 'default'}
                onClick={() => {
                  setSortField('nickname')
                  fetchComments({ orderBy: 'nickname', order: sortOrder })
                }}
              >
                Nickname
              </Button>
              <Button
                type={sortField === 'email' ? 'primary' : 'default'}
                onClick={() => {
                  setSortField('email')
                  fetchComments({ orderBy: 'email', order: sortOrder })
                }}
              >
                Email
              </Button>
            </Button.Group>
          </div>

          {/* Sort Order Selection */}
          <div>
            <span style={{ marginRight: '8px', fontWeight: 'bold' }}>Order:</span>
            <Button.Group>
              <Button
                type={sortOrder === 'desc' ? 'primary' : 'default'}
                onClick={() => {
                  setSortOrder('desc')
                  fetchComments({ orderBy: sortField, order: 'desc' })
                }}
              >
                Descending
              </Button>
              <Button
                type={sortOrder === 'asc' ? 'primary' : 'default'}
                onClick={() => {
                  setSortOrder('asc')
                  fetchComments({ orderBy: sortField, order: 'asc' })
                }}
              >
                Ascending
              </Button>
            </Button.Group>
          </div>
        </div>

        {/* Search Input */}
        <Input.Search
          placeholder='Search comments...'
          allowClear
          style={{ maxWidth: 300 }}
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
        />
      </div>
      <MakeComment open={open} setOpen={setOpen} />
      <List
        itemLayout='vertical'
        size='large'
        style={{ width: '100%' }}
        pagination={{
          onChange: page => {
            fetchComments({
              limit: 2,
              orderBy: sortField,
              order: sortOrder,
              offset: (page - 1) * 2,
            })
          },
          pageSize: 2,
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
