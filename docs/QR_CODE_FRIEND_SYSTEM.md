# QR Code Friend Request System

## Overview
The EnergySync app now supports functional QR codes for adding friends with parent authorization. When a user scans another user's QR code, a friend request is created that requires approval from the parent portal before the friendship is established.

## How It Works

### 1. **Generating QR Codes**
- Each user has a unique QR code accessible from the Profile tab
- The QR code contains:
  - User ID
  - User name
  - User avatar
- QR codes are encoded as JSON for rich information

### 2. **Scanning QR Codes**
- Users can scan a friend's QR code using their device camera
- The QR code modal has two tabs:
  - **My Code**: Displays the user's QR code for others to scan
  - **Scan Code**: Opens the camera to scan a friend's code

### 3. **Friend Request Flow**
1. Child A scans Child B's QR code
2. A friend request is created in Firestore (`friendRequests` collection)
3. The request status is set to "pending"
4. Child A sees a success message indicating the request was sent
5. Child B's parent receives a notification in the parent dashboard
6. Child B's parent can approve or reject the request

### 4. **Parent Authorization**
- Parents access the dashboard from the Parent Portal
- A "Pending Friend Requests" card shows all pending requests
- For each request, parents can see:
  - Friend's name and avatar
  - Time since the request was sent
  - Approve and Reject buttons

### 5. **Approval Process**
**When Approved:**
- The friend request status changes to "approved"
- Both children are added to each other's friend lists
- The friendship is now active
- Both can see each other in their Friend Network

**When Rejected:**
- The friend request status changes to "rejected"
- No friendship is established
- The request is archived

## Technical Implementation

### Database Structure

#### `friendRequests` Collection
```typescript
{
  id: string;                    // Unique request ID
  fromUserId: string;            // Requesting user's ID
  fromUserName: string;          // Requesting user's name
  fromUserAvatar: string;        // Requesting user's avatar
  toUserId: string;              // Target user's ID
  timestamp: string;             // When request was sent
  status: 'pending' | 'approved' | 'rejected';
}
```

### Key Components

1. **QRCodeModal** (`src/components/qr-code-modal.tsx`)
   - Shows user's QR code
   - Scans other users' QR codes
   - Uses `html5-qrcode` library for camera scanning

2. **PendingFriendRequests** (`src/components/pending-friend-requests.tsx`)
   - Displays pending requests in parent dashboard
   - Real-time updates using Firestore listeners
   - Handles approval and rejection

3. **AuthContext** (`src/context/AuthContext.tsx`)
   - `sendFriendRequest()`: Creates friend requests
   - `getPendingFriendRequests()`: Retrieves pending requests

### Firebase Rules Required

To enable this feature, add the following Firestore security rules:

```javascript
// Allow users to create friend requests
match /friendRequests/{requestId} {
  allow create: if request.auth != null;
  allow read: if request.auth != null && 
    (resource.data.fromUserId == request.auth.uid || 
     resource.data.toUserId == request.auth.uid);
  allow update: if request.auth != null;
  allow delete: if request.auth != null;
}
```

## User Experience

### For Children
1. Navigate to Profile tab
2. Tap "Share QR Code" button
3. Choose "Scan Code" tab
4. Point camera at friend's QR code
5. See success message
6. Wait for parent approval

### For Parents
1. Log in to Parent Portal
2. Select child's dashboard
3. View "Pending Friend Requests" card
4. Review friend request details
5. Click "Approve" or "Reject"
6. Friend is added (if approved)

## Features

✅ **Camera-based QR scanning** - Uses device camera for real-time scanning
✅ **Parent authorization** - All friend requests require parent approval
✅ **Real-time updates** - Parent dashboard updates automatically
✅ **Rich QR data** - QR codes include name and avatar information
✅ **Duplicate prevention** - Can't send requests to yourself or existing friends
✅ **Time tracking** - Shows how long ago requests were sent
✅ **Safe & secure** - Firestore security rules protect user data

## Future Enhancements

- [ ] Push notifications for pending requests
- [ ] Expiration for old pending requests
- [ ] Friend request history/audit log
- [ ] Bulk approve/reject functionality
- [ ] QR code customization (colors, logos)
- [ ] Share QR code via other methods (email, messaging)

## Dependencies

- `html5-qrcode` - Camera-based QR code scanning
- `react-qr-code` - QR code generation
- `date-fns` - Time formatting
- Firebase Firestore - Data persistence

## Testing

To test the friend request system:

1. Create two child accounts
2. Generate QR code for Child A
3. Scan Child A's QR code with Child B's device
4. Log in to Parent Portal as Child B's parent
5. Verify pending request appears
6. Approve the request
7. Check that both children now see each other as friends
