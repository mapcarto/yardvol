# 散货体积量算系统 - API参考文档

## API概述

散货体积量算系统提供REST API接口，允许第三方应用程序与系统进行集成。所有API请求需要进行身份验证，并使用HTTPS协议进行安全通信。

## 身份验证

### 获取访问令牌

```
POST /api/auth/token
```

**请求参数：**

| 参数名 | 类型 | 必填 | 描述 |
|-------|-----|------|-----|
| username | string | 是 | 用户名 |
| password | string | 是 | 密码 |

**响应示例：**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

### 使用访问令牌

所有API请求都需要在HTTP头部包含访问令牌：

```
Authorization: Bearer {access_token}
```

## 数据管理API

### 获取数据列表

```
GET /api/data
```

**查询参数：**

| 参数名 | 类型 | 必填 | 描述 |
|-------|-----|------|-----|
| page | integer | 否 | 页码，默认为1 |
| limit | integer | 否 | 每页记录数，默认为20 |
| sort | string | 否 | 排序字段，默认为created_at |
| order | string | 否 | 排序方式(asc/desc)，默认为desc |

**响应示例：**

```json
{
  "total": 100,
  "page": 1,
  "limit": 20,
  "data": [
    {
      "id": "d12345",
      "name": "2023-06-01扫描数据",
      "type": "point_cloud",
      "size": 256789012,
      "created_at": "2023-06-01T10:30:00Z",
      "status": "processed"
    },
    // ...更多数据项
  ]
}
```

### 上传数据

```
POST /api/data/upload
```

**请求参数：**

使用multipart/form-data格式上传文件

| 参数名 | 类型 | 必填 | 描述 |
|-------|-----|------|-----|
| file | file | 是 | 数据文件 |
| name | string | 是 | 数据名称 |
| description | string | 否 | 数据描述 |
| tags | string | 否 | 标签，多个标签用逗号分隔 |

**响应示例：**

```json
{
  "id": "d12346",
  "name": "2023-06-02扫描数据",
  "type": "point_cloud",
  "size": 156789012,
  "created_at": "2023-06-02T09:15:00Z",
  "status": "uploading"
}
```

### 获取数据详情

```
GET /api/data/{id}
```

**路径参数：**

| 参数名 | 类型 | 必填 | 描述 |
|-------|-----|------|-----|
| id | string | 是 | 数据ID |

**响应示例：**

```json
{
  "id": "d12345",
  "name": "2023-06-01扫描数据",
  "type": "point_cloud",
  "size": 256789012,
  "created_at": "2023-06-01T10:30:00Z",
  "updated_at": "2023-06-01T11:45:00Z",
  "status": "processed",
  "description": "北区A1堆场扫描数据",
  "tags": ["北区", "A1", "煤炭"],
  "metadata": {
    "point_count": 5678901,
    "dimensions": "XYZ",
    "has_color": true
  }
}
```

### 删除数据

```
DELETE /api/data/{id}
```

**路径参数：**

| 参数名 | 类型 | 必填 | 描述 |
|-------|-----|------|-----|
| id | string | 是 | 数据ID |

**响应示例：**

```json
{
  "success": true,
  "message": "数据已成功删除"
}
```

## 任务管理API

### 创建任务

```
POST /api/tasks
```

**请求参数：**

| 参数名 | 类型 | 必填 | 描述 |
|-------|-----|------|-----|
| data_id | string | 是 | 数据ID |
| name | string | 是 | 任务名称 |
| description | string | 否 | 任务描述 |
| parameters | object | 否 | 计算参数 |
| priority | string | 否 | 优先级(high/medium/low)，默认为medium |

**响应示例：**

```json
{
  "id": "t5678",
  "name": "A1堆场体积计算",
  "data_id": "d12345",
  "status": "pending",
  "created_at": "2023-06-02T14:20:00Z",
  "priority": "medium"
}
```

### 获取任务列表

```
GET /api/tasks
```

**查询参数：**

| 参数名 | 类型 | 必填 | 描述 |
|-------|-----|------|-----|
| page | integer | 否 | 页码，默认为1 |
| limit | integer | 否 | 每页记录数，默认为20 |
| status | string | 否 | 任务状态筛选 |
| sort | string | 否 | 排序字段，默认为created_at |
| order | string | 否 | 排序方式(asc/desc)，默认为desc |

**响应示例：**

```json
{
  "total": 50,
  "page": 1,
  "limit": 20,
  "data": [
    {
      "id": "t5678",
      "name": "A1堆场体积计算",
      "data_id": "d12345",
      "status": "completed",
      "created_at": "2023-06-02T14:20:00Z",
      "completed_at": "2023-06-02T14:25:30Z",
      "priority": "medium"
    },
    // ...更多任务项
  ]
}
```

### 获取任务详情

```
GET /api/tasks/{id}
```

**路径参数：**

| 参数名 | 类型 | 必填 | 描述 |
|-------|-----|------|-----|
| id | string | 是 | 任务ID |

**响应示例：**

```json
{
  "id": "t5678",
  "name": "A1堆场体积计算",
  "data_id": "d12345",
  "status": "completed",
  "created_at": "2023-06-02T14:20:00Z",
  "started_at": "2023-06-02T14:20:05Z",
  "completed_at": "2023-06-02T14:25:30Z",
  "priority": "medium",
  "description": "计算6月1日A1堆场煤炭体积",
  "parameters": {
    "algorithm": "alpha_shape",
    "resolution": "high",
    "ground_level": 0.5
  },
  "result": {
    "volume": 12567.89,
    "unit": "cubic_meters",
    "accuracy": 0.98,
    "processing_time": 325
  }
}
```

### 取消任务

```
POST /api/tasks/{id}/cancel
```

**路径参数：**

| 参数名 | 类型 | 必填 | 描述 |
|-------|-----|------|-----|
| id | string | 是 | 任务ID |

**响应示例：**

```json
{
  "success": true,
  "message": "任务已成功取消"
}
```

## 结果API

### 获取计算结果

```
GET /api/results/{task_id}
```

**路径参数：**

| 参数名 | 类型 | 必填 | 描述 |
|-------|-----|------|-----|
| task_id | string | 是 | 任务ID |

**响应示例：**

```json
{
  "task_id": "t5678",
  "data_id": "d12345",
  "created_at": "2023-06-02T14:25:30Z",
  "volume": 12567.89,
  "unit": "cubic_meters",
  "accuracy": 0.98,
  "details": {
    "surface_area": 4567.89,
    "max_height": 15.6,
    "bounding_box": {
      "min_x": 100.5,
      "min_y": 200.3,
      "min_z": 0.5,
      "max_x": 150.2,
      "max_y": 250.8,
      "max_z": 16.1
    }
  },
  "visualization_url": "/api/results/t5678/visualization"
}
```

### 导出结果报告

```
GET /api/results/{task_id}/export
```

**路径参数：**

| 参数名 | 类型 | 必填 | 描述 |
|-------|-----|------|-----|
| task_id | string | 是 | 任务ID |

**查询参数：**

| 参数名 | 类型 | 必填 | 描述 |
|-------|-----|------|-----|
| format | string | 是 | 导出格式(pdf/excel/csv) |

**响应：**

返回对应格式的文件下载

## 错误码

| 错误码 | 描述 |
|-------|-----|
| 400 | 请求参数错误 |
| 401 | 未授权或授权失败 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 409 | 资源冲突 |
| 429 | 请求过于频繁 |
| 500 | 服务器内部错误 |

## API限制

- 请求频率限制：每分钟60次请求
- 上传文件大小限制：单文件最大500MB
- 访问令牌有效期：1小时