# 族谱管理平台 (Genealogy Platform)

企业级 Web 端族谱管理系统，支持多代人物数据录入、复杂血缘与婚姻关系建模、交互式树状可视化、多人协作编辑、标准数据互通（GEDCOM）以及严格的隐私合规控制。

## 🏗️ 技术架构

### 前端层
- **Vue 3 + TypeScript** - 响应式核心框架
- **Vite** - 构建工具，秒级热更新
- **Naive UI** - 组件库
- **@antv/g6 + @antv/hierarchy** - 关系图渲染引擎
- **Pinia** - 状态管理
- **Axios** - HTTP 客户端

### 后端层
- **NestJS 10** - 企业级 Node.js 框架
- **TypeScript 5** - 全栈类型安全
- **Prisma 5** - 新一代 ORM
- **Passport + JWT** - 无状态鉴权
- **pino** - 高性能日志框架

### 数据与基础设施
- **PostgreSQL 14+** - 关系型数据库，支持 WITH RECURSIVE 递归查询
- **Redis 7** - 缓存与会话管理
- **BullMQ** - 异步任务队列
- **Docker + Nginx** - 容器化部署

## 🚀 快速开始

### 环境要求
- Node.js >= 18.0.0
- PostgreSQL >= 14
- Redis >= 7.0

### 1. 克隆项目
```bash
git clone <repository-url>
cd genealogy-platform
```

### 2. 安装依赖
```bash
# 根目录
npm install

# 后端
cd backend
npm install

# 前端 (待开发)
cd ../frontend
npm install
```

### 3. 配置环境变量
```bash
cd backend
cp .env.example .env
# 编辑 .env 文件配置数据库连接等
```

### 4. 初始化数据库
```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

### 5. 启动服务
```bash
# 后端
cd backend
npm run start:dev

# 访问 API 文档：http://localhost:3000/api-docs
```

## 📁 项目结构

```
genealogy-platform/
├── backend/                 # NestJS 后端
│   ├── src/
│   │   ├── auth/           # 认证模块
│   │   ├── user/           # 用户模块
│   │   ├── genealogy/      # 族谱模块
│   │   ├── common/         # 公共组件
│   │   │   ├── decorators/ # 装饰器
│   │   │   ├── guards/     # 守卫
│   │   │   ├── filters/    # 过滤器
│   │   │   └── interceptors/# 拦截器
│   │   ├── prisma/         # Prisma 服务
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── prisma/
│   │   └── schema.prisma   # 数据库模型
│   ├── package.json
│   └── .env.example
├── frontend/               # Vue 3 前端 (待开发)
├── docker-compose.yml      # Docker 编排
├── package.json            # 根包管理
└── README.md
```

## 🔑 核心功能

### 1. 用户与权限管理
- JWT 双 Token 机制 (Access/Refresh)
- RBAC 角色控制 (OWNER/EDITOR/VIEWER)
- 族谱级与节点级双重权限校验

### 2. 人物与关系管理
- 完整人物档案 (姓名、字号、生卒年月、籍贯等)
- 复杂关系建模 (血缘、婚姻、收养、过继等)
- 乐观锁并发控制
- 软删除机制

### 3. 递归查询优化
- PostgreSQL WITH RECURSIVE 实现祖先/后代查询
- 防循环检测 (visited 数组)
- 最大深度限制防止递归雪崩
- Redis 缓存热点路径

### 4. 隐私保护
- 动态脱敏策略
- PrivacyInterceptor 全局拦截
- 活人信息自动脱敏
- 符合《个人信息保护法》

### 5. 数据导入导出
- GEDCOM 5.5.1/7.0 标准支持
- BullMQ 异步处理大文件
- WebSocket 实时进度推送

## 📡 API 接口

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /api/v1/auth/register | 用户注册 |
| POST | /api/v1/auth/login | 用户登录 |
| GET | /api/v1/auth/profile | 获取当前用户信息 |
| POST | /api/v1/genealogy/trees | 创建族谱 |
| GET | /api/v1/genealogy/trees | 获取用户族谱列表 |
| GET | /api/v1/genealogy/trees/:id | 获取族谱详情 |
| POST | /api/v1/genealogy/persons | 创建人物 |
| PUT | /api/v1/genealogy/persons/:id | 更新人物 |
| DELETE | /api/v1/genealogy/persons/:id | 删除人物 |
| GET | /api/v1/genealogy/persons/:id/ancestors | 获取祖先 |
| GET | /api/v1/genealogy/persons/:id/descendants | 获取后代 |
| GET | /api/v1/genealogy/trees/:id/family-tree | 获取完整族谱树 |

详细 API 文档请访问：`http://localhost:3000/api-docs`

## 🔒 安全特性

- SQL 注入防护 (Prisma 参数化查询)
- XSS 防护
- CORS 严格配置
- 速率限制
- 敏感操作二次验证
- 完整审计日志

## 📝 开发规范

- Git Flow 分支管理
- Conventional Commits 提交规范
- ESLint + Prettier 代码风格
- Jest 单元测试 (>70% 覆盖率)

## 📄 许可证

MIT License
