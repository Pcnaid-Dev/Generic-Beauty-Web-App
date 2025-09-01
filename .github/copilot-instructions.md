# Pixshop - AI-Powered Beauty Web App

**Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.**

Pixshop is a React + TypeScript web application that provides AI-powered photo editing using Google's Gemini API. The app features sophisticated image editing capabilities including face detection, makeup application, hair styling, background changes, and layer-based editing with undo/redo functionality.

## Working Effectively

### Essential Setup Commands
Run these commands in exact order for any fresh clone:

```bash
# Verify Node.js is available (requires Node.js)
node --version  # Should show v20+ 
npm --version   # Should show v10+

# Install dependencies - takes ~11 seconds
npm install

# Build the application - takes ~3 seconds, NEVER CANCEL
npm run build

# Start development server - ready in ~219ms
npm run dev
```

**CRITICAL TIMING EXPECTATIONS:**
- **npm install**: 11 seconds - NEVER CANCEL this process
- **npm run build**: 3 seconds - NEVER CANCEL, set timeout to 30+ seconds  
- **npm run dev**: Starts in 219ms, runs on http://localhost:5173/
- **TypeScript check**: 6 seconds - `npx tsc --noEmit` has some non-blocking errors in unused files

### API Key Configuration
The application requires Google Gemini API key:

```bash
# Create .env.local file with API key
echo "GEMINI_API_KEY=your_gemini_api_key_here" > .env.local
```

**Note:** The app will load without the API key but AI features will not work.

## Validation Steps

### Required Manual Testing Scenarios
After making ANY changes, ALWAYS perform these validation steps:

1. **Build Validation**:
   ```bash
   npm run build  # Must complete without errors
   ```

2. **Development Server Test**:
   ```bash
   npm run dev  # Start server
   # Navigate to http://localhost:5173/
   # Verify start screen loads with:
   # - Pixshop logo and starfield background
   # - Sidebar with Presets, Face, Body, Scene, Canvas, Export sections
   # - Main content area with "AI-Powered Photo Editing, Simplified" header
   # - Upload button and feature cards visible
   ```

3. **Component Structure Test**:
   - Sidebar should be collapsible and show all navigation sections
   - Header should display with proper layout
   - No console errors in browser developer tools (except blocked external resources)

### Build System Verification
```bash
# Clean build test (use when troubleshooting)
rm -rf dist node_modules package-lock.json
npm install
npm run build
npm run dev
```

## Application Architecture

### Core File Structure
```
├── App.tsx                 # Main application component (NOT in /src/)
├── components/             # All React components
│   ├── Header.tsx         # Top navigation bar
│   ├── Sidebar.tsx        # Left navigation panel
│   ├── StartScreen.tsx    # Upload/welcome screen
│   ├── *Panel.tsx         # Various editing panels
│   ├── icons.tsx          # Comprehensive icon library
│   └── ...
├── services/
│   ├── geminiService.ts   # AI image processing
│   └── dbService.ts       # Local storage management
├── index.html             # Entry point with Tailwind CDN
├── index.tsx              # React app mounting
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
└── vite.config.ts         # Build configuration
```

### Key Application Features
- **Face Detection & Editing**: Automatic face detection for targeted edits
- **Layer System**: Undo/redo with layer-based editing
- **AI-Powered Tools**: Makeup, hair styling, age modification, expressions
- **Background Processing**: Scene changes and people removal
- **Responsive Design**: Adaptive layout with collapsible sidebar
- **Real-time Preview**: Live image editing with immediate feedback

## Development Workflow

### Common Tasks

**Adding New Icons:**
Icons are centralized in `/components/icons.tsx`. Add new icons using this pattern:
```typescript
export const NewIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="..." />
    </svg>
);
```

**Component Development:**
- All components use TypeScript with strict typing
- Icons imported from `'./icons'`
- Styling uses Tailwind CSS classes
- State management via React hooks

**Service Integration:**
- `geminiService.ts`: Handles all AI image processing
- `dbService.ts`: Manages local IndexedDB storage
- API calls require error handling for network issues

### Troubleshooting Common Issues

**Build Errors:**
- Missing icons: Add to `/components/icons.tsx`
- TypeScript errors: Focus on main application files, ignore `/src/App.tsx` errors
- Import issues: Check file paths are relative to project root

**Runtime Issues:**
- API failures: Verify GEMINI_API_KEY in .env.local
- Image loading: Check network connectivity and CORS policies
- Component errors: Verify all imports are properly exported

**Performance:**
- Build produces 523KB main bundle (warning is expected)
- Development mode uses hot reload for fast iteration
- Large images may require processing time

## Testing & Validation

**No automated testing framework is currently configured.** All testing must be done manually:

1. **Functionality Test**: Upload an image and verify sidebar tools are accessible
2. **Responsive Test**: Resize browser window to test mobile/desktop layouts  
3. **Error Handling**: Test without API key to ensure graceful degradation
4. **Performance Test**: Build and verify production bundle size and startup time

**Browser Console Monitoring:**
- Blocked external resources (CDN) are expected and non-blocking
- No JavaScript errors should appear during normal operation
- Vite HMR messages are normal in development mode

## Available Commands

```bash
npm run dev      # Development server (fast startup)
npm run build    # Production build (optimized)
npm run preview  # Preview production build
npx tsc --noEmit # TypeScript type checking
```

**No linting, testing, or formatting scripts are configured.**

## Critical Reminders

- **NEVER CANCEL** build processes - they complete quickly
- **Always test manually** after changes - no automated tests exist
- **API key required** for full functionality testing
- **TypeScript errors** in `/src/App.tsx` are expected and non-blocking
- **External resource blocks** in browser console are normal
- **Main App component** is at `/App.tsx`, not `/src/App.tsx`