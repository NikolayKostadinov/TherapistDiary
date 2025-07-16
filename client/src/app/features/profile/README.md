# Profile Image Upload Component

## Преглед

`ProfileImageUploadComponent` е standalone Angular компонент за качване и управление на профилни снимки чрез Firebase Storage.

## ✨ Характеристики

- **File Upload** - Качване на изображения към Firebase Storage
- **File Override** - Автоматично заменя съществуващи файлове
- **Preview** - Преглед на избраната снимка преди качване
- **Validation** - Проверка на файлов тип и размер
- **Progress Indicators** - Loading states и feedback
- **Image Display** - Показва текущата профилна снимка
- **Responsive Design** - Работи на всички устройства

## 🚀 Използване

### Basic Setup
```typescript
import { ProfileImageUploadComponent } from './features/profile';

@Component({
    template: `
        <app-profile-image-upload 
            [userId]="currentUserId"
            [currentImageUrl]="userImageUrl">
        </app-profile-image-upload>
    `
})
export class MyComponent {
    currentUserId = 'user-123';
    userImageUrl = 'https://example.com/current-image.jpg';
}
```

### API

#### Inputs
```typescript
@Input() userId!: string;              // Required - Firebase storage path
@Input() currentImageUrl?: string;     // Optional - existing image URL
```

#### Features
- **File validation** - Само изображения, макс 5MB
- **Auto preview** - Показва избраната снимка
- **Error handling** - User-friendly error messages
- **Loading states** - Visual feedback за upload процеса

## 🎨 UI/UX Features

### Current Image Display
- Кръгъл профил изглед
- Hover ефекти с действия
- "Премахни" бутон при hover

### File Upload
- Drag & drop style interface
- Красив upload бутон с икони
- File info display (име, размер)

### Preview System
- Instant preview след избор на файл
- File information display
- Upload/Cancel действия

### Validation Feedback
- Real-time file validation
- Clear error messages
- Upload requirements display

## 🔧 Технически детайли

### Dependencies
- **Firebase Storage** - За file upload
- **Angular Signals** - Reactive state management  
- **ToasterService** - User notifications
- **Bootstrap/FontAwesome** - Styling и икони

### File Validation
```typescript
// File type validation
if (!file.type.startsWith('image/')) {
    // Error: Only images allowed
}

// File size validation (5MB max)
if (file.size > 5 * 1024 * 1024) {
    // Error: File too large
}
```

### Firebase Integration
```typescript
// Upload with automatic override
this.firebaseService.uploadProfileImage(file, userId).subscribe({
    next: (downloadUrl) => {
        // Success - image uploaded
        this.imageUrl.set(downloadUrl);
    },
    error: (error) => {
        // Handle upload error
    }
});
```

## 🎯 Demo

Можете да тествате компонента на:
```
http://localhost:4200/profile-demo
```

Demo страницата включва:
- Live preview на компонента
- Контроли за userId и currentImageUrl
- Тестване на всички функционалности

## 📱 Responsive Design

### Desktop
- Големи preview изображения (200x200px)
- Хоризонтални бутони
- Rich hover ефекти

### Mobile
- По-малки preview изображения (150x150px)
- Вертикални бутони
- Touch-friendly interface
- Optimized spacing

## 🔒 Security & Best Practices

### File Security
- Client-side file type validation
- File size limitations
- Firebase Storage security rules

### User Experience
- Immediate visual feedback
- Clear error messages
- Graceful error handling
- Loading indicators

### Performance
- Efficient file upload
- Image compression готовност
- Minimal re-renders с signals

## 🚀 Extensibility

### Ready for:
- **Image resizing** - Client или server-side
- **Multiple file formats** - Easy validation update  
- **Progress bars** - Upload progress tracking
- **Crop functionality** - Image editing features
- **Batch uploads** - Multiple files support

### Integration готовност:
- **User profiles** - Easy profile integration
- **Admin panels** - Management interfaces
- **Social features** - Avatar updates
- **Content management** - Image libraries

## 📋 Configuration

### Firebase Storage Path
```typescript
// Default path pattern
`profile-images/${userId}`

// Customizable via API_ENDPOINTS
API_ENDPOINTS.FIREBASE.UPLOAD_PROFILE_IMAGE
```

### File Restrictions
```typescript
// Current settings
- Max size: 5MB
- Allowed types: image/*
- Recommended: 400x400px

// Easy to modify in component
```

## ✅ Production Ready

- **Error handling** - Comprehensive error management
- **Loading states** - User feedback на всички actions
- **Responsive** - Mobile и desktop support
- **Accessible** - Keyboard navigation и ARIA labels
- **Performance** - Optimized с Angular signals
- **Secure** - Client validation + Firebase security
