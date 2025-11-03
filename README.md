# Backend for Image and Text Storage

A Node.js backend API that provides storage and access to images and text entities. The API allows public read access to all resources, while write/edit/delete operations are protected by a secret key.

## Features

- **Image Storage**: Upload, retrieve, and delete images
- **Text Storage**: Create, read, update, and delete text entities
- **Public Access**: Anyone can read images and text without authentication
- **Protected Editing**: Only users with the secret key can modify data

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Edit `.env` and set your secret key:
   ```
   SECRET=your-secret-key-here
   PORT=3000
   ```

## Running the Server

```bash
npm start
```

The server will start on `http://localhost:3000` (or the port specified in `.env`).

## API Endpoints

### Public Endpoints (No Authentication Required)

#### Get All Text Entities
```
GET /api/texts
```
Returns an array of all text entities.

**Example Response:**
```json
[
  {
    "id": "1699123456789",
    "title": "My First Text",
    "content": "This is the content",
    "createdAt": "2023-11-04T12:34:56.789Z",
    "updatedAt": "2023-11-04T12:34:56.789Z"
  }
]
```

#### Get Specific Text Entity
```
GET /api/texts/:id
```
Returns a single text entity by ID.

#### Get All Images (List)
```
GET /api/images
```
Returns an array of all images with their filenames and URLs.

**Example Response:**
```json
[
  {
    "filename": "1699123456789-123456789.jpg",
    "url": "/api/images/1699123456789-123456789.jpg"
  }
]
```

#### Get Specific Image
```
GET /api/images/:filename
```
Returns the image file.

### Protected Endpoints (Require Secret Authentication)

For all protected endpoints, include the secret in one of these ways:
- Header: `x-secret: your-secret-key`
- Query parameter: `?secret=your-secret-key`
- Body: `{ "secret": "your-secret-key" }`

#### Upload Image
```
POST /api/images
```
Upload a new image file. Send as multipart/form-data with field name `image`.

**Example using cURL:**
```bash
curl -X POST http://localhost:3000/api/images \
  -H "x-secret: your-secret-key" \
  -F "image=@/path/to/image.jpg"
```

**Response:**
```json
{
  "message": "Image uploaded successfully",
  "filename": "1699123456789-123456789.jpg",
  "url": "/api/images/1699123456789-123456789.jpg"
}
```

#### Delete Image
```
DELETE /api/images/:filename
```
Delete an image by filename.

#### Create Text Entity
```
POST /api/texts
```
Create a new text entity.

**Request Body:**
```json
{
  "title": "My Title",
  "content": "My content here"
}
```

**Response:**
```json
{
  "id": "1699123456789",
  "title": "My Title",
  "content": "My content here",
  "createdAt": "2023-11-04T12:34:56.789Z",
  "updatedAt": "2023-11-04T12:34:56.789Z"
}
```

#### Update Text Entity
```
PUT /api/texts/:id
```
Update an existing text entity.

**Request Body:**
```json
{
  "title": "Updated Title",
  "content": "Updated content"
}
```

#### Delete Text Entity
```
DELETE /api/texts/:id
```
Delete a text entity by ID.

## Example Usage

### Public Access (No Secret Required)

```bash
# Get all texts
curl http://localhost:3000/api/texts

# Get all images
curl http://localhost:3000/api/images

# Download a specific image
curl http://localhost:3000/api/images/filename.jpg -o image.jpg
```

### Protected Access (Secret Required)

```bash
# Create a new text
curl -X POST http://localhost:3000/api/texts \
  -H "Content-Type: application/json" \
  -H "x-secret: your-secret-key" \
  -d '{"title": "Test", "content": "Hello World"}'

# Upload an image
curl -X POST http://localhost:3000/api/images \
  -H "x-secret: your-secret-key" \
  -F "image=@photo.jpg"

# Update a text
curl -X PUT http://localhost:3000/api/texts/1699123456789 \
  -H "Content-Type: application/json" \
  -H "x-secret: your-secret-key" \
  -d '{"content": "Updated content"}'

# Delete an image
curl -X DELETE http://localhost:3000/api/images/filename.jpg \
  -H "x-secret: your-secret-key"
```

## Security

- The secret key should be kept confidential
- Images are filtered to only allow common image formats (JPEG, PNG, GIF, WebP)
- File size limit is set to 10MB
- All dependencies are checked for vulnerabilities

## File Storage

- Images are stored in `uploads/images/`
- Text data is stored in `uploads/texts.json`
- Both directories are created automatically on server start

## License

ISC