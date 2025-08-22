# Amazon Collaborative Wishlist - Documentation

Welcome to the comprehensive documentation for the Amazon Collaborative Wishlist application. This documentation covers all aspects of the system architecture, from individual microservices to database schemas.

## 📚 Documentation Index

### 🏗️ Architecture Overview
- **[01-api-gateway.md](01-api-gateway.md)** - API Gateway service documentation
- **[02-user-service.md](02-user-service.md)** - User authentication and profile management
- **[03-wishlist-service.md](03-wishlist-service.md)** - Wishlist and item management
- **[04-collaboration-service.md](04-collaboration-service.md)** - Sharing, invitations, and comments

### 🗄️ Database Documentation
- **[05-database-erd-full.md](05-database-erd-full.md)** - Complete database schema with all features
- **[database_erd.md](database_erd.md)** - Simplified database schema diagram

## 🏛️ System Architecture

The Amazon Collaborative Wishlist application follows a **microservices architecture** with the following components:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Frontend  │    │   API Gateway   │    │  User Service   │
│   (React/Vite)  │◄──►│   (Express.js)  │◄──►│   (Express.js)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │ Wishlist Service│    │Collaboration Svc│
                       │   (Express.js)  │◄──►│   (Express.js)  │
                       └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   PostgreSQL    │
                       │   Database      │
                       └─────────────────┘
```

### Service Responsibilities

| Service | Port | Responsibility |
|---------|------|----------------|
| **API Gateway** | 8080 | Central entry point, authentication, data enrichment |
| **User Service** | 3001 | User authentication, profiles, JWT management |
| **Wishlist Service** | 3002 | Wishlist and item CRUD operations |
| **Collaboration Service** | 3003 | Sharing, invitations, comments, access control |

## 🔄 Data Flow

### Typical Request Flow
1. **Frontend** sends request to API Gateway
2. **API Gateway** validates JWT token and extracts user context
3. **API Gateway** routes request to appropriate microservice
4. **Microservice** processes request and returns data
5. **API Gateway** enriches data from multiple services if needed
6. **Frontend** receives complete response

### Example: Viewing a Wishlist
```
Frontend → API Gateway → Wishlist Service (get wishlist)
                    ↓
                Collaboration Service (get user role)
                    ↓
                User Service (enrich comments with user data)
                    ↓
                Frontend (complete wishlist with items, role, comments)
```

## 🗄️ Database Architecture

The application uses **PostgreSQL** with **schema separation**:

### Schemas
- **`user`** - User management and profiles
- **`wishlist`** - Wishlist and item data
- **`collab`** - Collaboration, sharing, and comments

### Key Tables
- `user.user` - User accounts and profiles
- `wishlist.wishlist` - Wishlist containers
- `wishlist.wishlist_item` - Items within wishlists
- `collab.wishlist_invite` - Invitation tokens with access types
- `collab.wishlist_access` - User access permissions with roles
- `collab.wishlist_item_comment` - Comments on items

## 🔐 Security & Access Control

### Authentication
- **JWT-based authentication** managed by User Service
- **Token validation** at API Gateway level
- **User context** passed via `x-user-id` headers

### Authorization
- **Role-based access control** for wishlist collaboration
- **Permission levels**: owner, view_only, view_edit, comment_only
- **Invitation-based sharing** with expiration tokens and access types

### Privacy Levels
- **Private** - Only owner and invited users
- **Public** - Anyone with the link can view
- **Shared** - Controlled access through invitations

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- PostgreSQL (v16+)
- Docker (for containerized deployment)

### Quick Start
1. Clone the repository
2. Set up PostgreSQL database
3. Run database migrations (`db/init/`)
4. Start services with Docker Compose (`ops/docker-compose.yml`)
5. Access the application at `http://localhost:5173`

### Environment Variables
```bash
# Database
DATABASE_URL=postgresql://app:app@localhost:5432/wishlist

# JWT
JWT_SECRET=your_jwt_secret_here

# Service URLs (for Docker)
USER_SVC_URL=http://user-service:3001
WISHLIST_SVC_URL=http://wishlist-service:3002
COLLAB_SVC_URL=http://collaboration-service:3003
```

## 📊 API Endpoints

### Public Endpoints
- `GET /products` - Product catalog
- `POST /auth/login` - User authentication
- `GET /api/invites/:token` - Invitation preview

### Protected Endpoints
- `GET /api/me` - Current user profile
- `GET /api/wishlists/mine` - User's wishlists
- `GET /api/wishlists/friends` - Wishlists shared with user
- `GET /api/wishlists/:id` - Specific wishlist with items and role
- `POST /api/wishlists` - Create wishlist
- `POST /api/wishlists/:id/items` - Add item
- `DELETE /api/wishlists/:id/items/:itemId` - Remove item

### Collaboration Endpoints
- `GET /api/wishlists/:id/access` - List collaborators (owner only)
- `DELETE /api/wishlists/:id/access/:userId` - Remove collaborator (owner only)
- `PATCH /api/wishlists/:id/access/:userId` - Update collaborator role (owner only)
- `POST /api/wishlists/:id/invites` - Create invitation with access type (owner only)
- `POST /api/invites/:token/accept` - Accept invitation

### Comments Endpoints
- `GET /api/wishlists/:id/items/:itemId/comments` - Get comments for item
- `POST /api/wishlists/:id/items/:itemId/comments` - Add comment to item

## 🔧 Development

### Code Structure
```
amazon-collab-wishlist/
├── apps/
│   ├── api-gateway/          # API Gateway service
│   ├── user-service/         # User management
│   ├── wishlist-service/     # Wishlist operations
│   ├── collaboration-service/ # Collaboration features
│   └── web-frontend/         # React frontend with Vite
├── db/
│   └── init/                 # Database migrations
├── ops/
│   └── docker-compose.yml    # Deployment configuration
└── docs/                     # This documentation
```

### Development Workflow
1. **Feature Development** - Work on individual microservices
2. **Integration Testing** - Test service interactions
3. **API Gateway Updates** - Update routing and enrichment logic
4. **Frontend Integration** - Update UI components
5. **Database Migrations** - Update schema if needed

## 🧪 Testing

### Service Testing
- Each microservice has its own test suite
- Mock external dependencies for unit tests
- Integration tests for service interactions

### API Testing
- Test API Gateway endpoints
- Verify data enrichment functionality
- Test authentication and authorization

### Database Testing
- Test database migrations
- Verify data integrity constraints
- Test performance with sample data

## 📈 Performance & Scalability

### Performance Optimizations
- **Database indexing** on frequently queried fields
- **Connection pooling** for database connections
- **Caching opportunities** for user profiles and product data
- **Efficient queries** with proper joins and filtering

### Scalability Considerations
- **Horizontal scaling** of microservices
- **Database partitioning** for large datasets
- **Load balancing** for API Gateway
- **Caching strategies** for frequently accessed data

## 🛠️ Monitoring & Observability

### Health Checks
- Each service provides `/health` endpoint
- Monitor service availability and response times
- Track database connection status

### Logging
- Structured logging across all services
- Error tracking and alerting
- Request tracing for debugging

### Metrics
- API response times
- Database query performance
- Service resource utilization

## 🔄 Deployment

### Docker Deployment
```bash
# Build and start all services
docker-compose -f ops/docker-compose.yml up -d

# View logs
docker-compose -f ops/docker-compose.yml logs -f

# Stop services
docker-compose -f ops/docker-compose.yml down
```

### Production Considerations
- **Environment variables** for configuration
- **Database backups** and recovery procedures
- **SSL/TLS** for secure communication
- **Rate limiting** and DDoS protection
- **Monitoring** and alerting setup

## 🤝 Contributing

### Development Guidelines
1. **Service Isolation** - Keep services independent
2. **API Design** - Follow RESTful principles
3. **Error Handling** - Implement proper error responses
4. **Documentation** - Update docs for new features
5. **Testing** - Add tests for new functionality

### Code Review Process
1. **Feature Branch** - Create branch for new feature
2. **Service Changes** - Update relevant microservice
3. **Integration** - Test with other services
4. **Documentation** - Update relevant docs
5. **Review** - Submit pull request for review

## 📞 Support

### Troubleshooting
- Check service health endpoints
- Review application logs
- Verify database connectivity
- Test API endpoints directly

### Common Issues
- **JWT Token Issues** - Check JWT_SECRET configuration
- **Database Connection** - Verify DATABASE_URL
- **Service Communication** - Check service URLs and ports
- **CORS Issues** - Verify CORS configuration

## 🎯 Key Features

### Full Collaboration System
- **Comments on Items** - Users can comment on wishlist items
- **Role-Based Access Control** - Granular permissions (view_only, view_edit, comment_only)
- **Advanced Invitations** - Support for different access types during invitation
- **User Enrichment** - Comments include user profile information
- **Permission Validation** - Proper checking of user permissions for actions

### Frontend Features
- **Comment Threads** - Expandable comment sections on items
- **Role Management** - UI for managing collaborator roles
- **Advanced Sharing** - Invitation links with access type selection
- **Real-time Updates** - Dynamic comment loading and display

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Last Updated**: January 2024  
**Version**: 1.0.0  
**Maintainer**: Development Team 