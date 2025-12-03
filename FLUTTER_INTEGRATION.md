# Flutter Integration Guide

Complete guide for integrating the Food Delivery Backend API into your Flutter mobile application.

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Setup](#setup)
- [Authentication](#authentication)
- [API Service Layer](#api-service-layer)
- [Complete Code Examples](#complete-code-examples)
- [Error Handling](#error-handling)
- [Best Practices](#best-practices)

## 🚀 Quick Start

### Base URLs

```dart
// Development
const String API_BASE_URL = 'http://localhost:9090/api';

// Production
const String API_BASE_URL = 'https://backend-delivery-app-ynzy.onrender.com/api';
```

### Required Packages

Add to your `pubspec.yaml`:

```yaml
dependencies:
  flutter:
    sdk: flutter
  http: ^1.1.0
  shared_preferences: ^2.2.2
  image_picker: ^1.0.4
  dio: ^5.3.3  # Alternative to http package (recommended)
```

## 🔧 Setup

### 1. Create API Constants

```dart
// lib/constants/api_constants.dart

class ApiConstants {
  // Base URL
  static const String baseUrl = 'https://backend-delivery-app-ynzy.onrender.com/api';

  // Auth Endpoints
  static const String register = '$baseUrl/auth/register';
  static const String login = '$baseUrl/auth/login';
  static const String verifyEmail = '$baseUrl/auth/verify-email';
  static const String forgotPassword = '$baseUrl/auth/forgot-password';
  static const String resetPassword = '$baseUrl/auth/reset-password';
  static const String refreshToken = '$baseUrl/auth/refresh-token';
  static const String logout = '$baseUrl/auth/logout';

  // Customer Endpoints
  static const String profile = '$baseUrl/customers/profile';
  static const String uploadPhoto = '$baseUrl/customers/profile/upload-photo';
  static const String addresses = '$baseUrl/customers/addresses';
  static const String deactivateAccount = '$baseUrl/customers/deactivate';
  static const String deleteAccount = '$baseUrl/customers/delete';
}
```

### 2. Create Token Manager

```dart
// lib/services/token_manager.dart

import 'package:shared_preferences/shared_preferences.dart';

class TokenManager {
  static const String _accessTokenKey = 'access_token';
  static const String _refreshTokenKey = 'refresh_token';

  // Save tokens
  static Future<void> saveTokens(String accessToken, String refreshToken) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_accessTokenKey, accessToken);
    await prefs.setString(_refreshTokenKey, refreshToken);
  }

  // Get access token
  static Future<String?> getAccessToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_accessTokenKey);
  }

  // Get refresh token
  static Future<String?> getRefreshToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_refreshTokenKey);
  }

  // Clear tokens (logout)
  static Future<void> clearTokens() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_accessTokenKey);
    await prefs.remove(_refreshTokenKey);
  }

  // Check if user is logged in
  static Future<bool> isLoggedIn() async {
    final token = await getAccessToken();
    return token != null && token.isNotEmpty;
  }
}
```

## 🔐 Authentication

### Register User

```dart
// lib/services/auth_service.dart

import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:image_picker/image_picker.dart';

class AuthService {
  // Register
  static Future<Map<String, dynamic>> register({
    required String name,
    required String email,
    required String phone,
    required String password,
    XFile? profileImage,
  }) async {
    try {
      var request = http.MultipartRequest(
        'POST',
        Uri.parse(ApiConstants.register),
      );

      // Add fields
      request.fields['name'] = name;
      request.fields['email'] = email;
      request.fields['phone'] = phone;
      request.fields['password'] = password;

      // Add image if provided
      if (profileImage != null) {
        request.files.add(
          await http.MultipartFile.fromPath('upload', profileImage.path),
        );
      }

      // Send request
      final response = await request.send();
      final responseData = await response.stream.bytesToString();
      final data = json.decode(responseData);

      if (response.statusCode == 201) {
        // Save tokens
        await TokenManager.saveTokens(
          data['token'],
          data['refreshToken'],
        );
        return {'success': true, 'data': data};
      } else {
        return {'success': false, 'message': data['message']};
      }
    } catch (e) {
      return {'success': false, 'message': 'Network error: $e'};
    }
  }
}
```

### Login

```dart
// Login
static Future<Map<String, dynamic>> login({
  required String email,
  required String password,
}) async {
  try {
    final response = await http.post(
      Uri.parse(ApiConstants.login),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({
        'email': email,
        'password': password,
      }),
    );

    final data = json.decode(response.body);

    if (response.statusCode == 200) {
      // Save tokens
      await TokenManager.saveTokens(
        data['token'],
        data['refreshToken'],
      );
      return {'success': true, 'data': data};
    } else {
      return {'success': false, 'message': data['message']};
    }
  } catch (e) {
    return {'success': false, 'message': 'Network error: $e'};
  }
}
```

### Forgot Password

```dart
// Forgot Password (Step 1 - Request reset email)
static Future<Map<String, dynamic>> forgotPassword(String email) async {
  try {
    final response = await http.post(
      Uri.parse(ApiConstants.forgotPassword),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({'email': email}),
    );

    final data = json.decode(response.body);

    return {
      'success': response.statusCode == 200,
      'message': data['message'],
    };
  } catch (e) {
    return {'success': false, 'message': 'Network error: $e'};
  }
}

// Reset Password (Step 2 - After clicking email link)
static Future<Map<String, dynamic>> resetPassword({
  required String token,
  required String newPassword,
}) async {
  try {
    final response = await http.post(
      Uri.parse(ApiConstants.resetPassword),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({
        'token': token,
        'newPassword': newPassword,
      }),
    );

    final data = json.decode(response.body);

    return {
      'success': response.statusCode == 200,
      'message': data['message'],
    };
  } catch (e) {
    return {'success': false, 'message': 'Network error: $e'};
  }
}
```

### Logout

```dart
// Logout
static Future<void> logout() async {
  try {
    final token = await TokenManager.getAccessToken();

    if (token != null) {
      await http.post(
        Uri.parse(ApiConstants.logout),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );
    }
  } catch (e) {
    print('Logout error: $e');
  } finally {
    // Always clear local tokens
    await TokenManager.clearTokens();
  }
}
```

## 👤 Customer Profile Management

### Get Profile

```dart
// lib/services/customer_service.dart

class CustomerService {
  // Get Profile
  static Future<Map<String, dynamic>> getProfile() async {
    try {
      final token = await TokenManager.getAccessToken();

      final response = await http.get(
        Uri.parse(ApiConstants.profile),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      final data = json.decode(response.body);

      if (response.statusCode == 200) {
        return {'success': true, 'data': data['customer']};
      } else {
        return {'success': false, 'message': data['message']};
      }
    } catch (e) {
      return {'success': false, 'message': 'Network error: $e'};
    }
  }
}
```

### Update Profile

```dart
// Update Profile
static Future<Map<String, dynamic>> updateProfile({
  String? name,
  String? phone,
  String? language,
}) async {
  try {
    final token = await TokenManager.getAccessToken();

    Map<String, dynamic> body = {};
    if (name != null) body['name'] = name;
    if (phone != null) body['phone'] = phone;
    if (language != null) body['language'] = language;

    final response = await http.put(
      Uri.parse(ApiConstants.profile),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: json.encode(body),
    );

    final data = json.decode(response.body);

    return {
      'success': response.statusCode == 200,
      'message': data['message'],
      'data': data['customer'],
    };
  } catch (e) {
    return {'success': false, 'message': 'Network error: $e'};
  }
}
```

### Upload Profile Photo

```dart
// Upload Profile Photo
static Future<Map<String, dynamic>> uploadProfilePhoto(XFile image) async {
  try {
    final token = await TokenManager.getAccessToken();

    var request = http.MultipartRequest(
      'POST',
      Uri.parse(ApiConstants.uploadPhoto),
    );

    request.headers['Authorization'] = 'Bearer $token';
    request.files.add(
      await http.MultipartFile.fromPath('upload', image.path),
    );

    final response = await request.send();
    final responseData = await response.stream.bytesToString();
    final data = json.decode(responseData);

    if (response.statusCode == 200) {
      return {
        'success': true,
        'message': data['message'],
        'imageUrl': data['profileImage'],
      };
    } else {
      return {'success': false, 'message': data['message']};
    }
  } catch (e) {
    return {'success': false, 'message': 'Network error: $e'};
  }
}
```

## 📍 Address Management

### Get All Addresses

```dart
// Get Addresses
static Future<Map<String, dynamic>> getAddresses() async {
  try {
    final token = await TokenManager.getAccessToken();

    final response = await http.get(
      Uri.parse(ApiConstants.addresses),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );

    final data = json.decode(response.body);

    if (response.statusCode == 200) {
      return {'success': true, 'addresses': data['addresses']};
    } else {
      return {'success': false, 'message': data['message']};
    }
  } catch (e) {
    return {'success': false, 'message': 'Network error: $e'};
  }
}
```

### Add New Address

```dart
// Add Address
static Future<Map<String, dynamic>> addAddress({
  required String type,  // 'home', 'office', 'apartment', 'other'
  required String street,
  required String city,
  required String state,
  required String postalCode,
  required String country,
  String? label,
  String? building,
  String? floor,
  String? apartment,
  String? landmark,
  String? deliveryInstructions,
  double? latitude,
  double? longitude,
}) async {
  try {
    final token = await TokenManager.getAccessToken();

    Map<String, dynamic> addressData = {
      'type': type,
      'street': street,
      'city': city,
      'state': state,
      'postalCode': postalCode,
      'country': country,
    };

    // Add optional fields
    if (label != null) addressData['label'] = label;
    if (building != null) addressData['building'] = building;
    if (floor != null) addressData['floor'] = floor;
    if (apartment != null) addressData['apartment'] = apartment;
    if (landmark != null) addressData['landmark'] = landmark;
    if (deliveryInstructions != null) addressData['deliveryInstructions'] = deliveryInstructions;
    if (latitude != null) addressData['latitude'] = latitude;
    if (longitude != null) addressData['longitude'] = longitude;

    final response = await http.post(
      Uri.parse(ApiConstants.addresses),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: json.encode(addressData),
    );

    final data = json.decode(response.body);

    return {
      'success': response.statusCode == 201,
      'message': data['message'],
      'address': data['address'],
    };
  } catch (e) {
    return {'success': false, 'message': 'Network error: $e'};
  }
}
```

### Update Address

```dart
// Update Address
static Future<Map<String, dynamic>> updateAddress({
  required String addressId,
  Map<String, dynamic>? updates,
}) async {
  try {
    final token = await TokenManager.getAccessToken();

    final response = await http.put(
      Uri.parse('${ApiConstants.addresses}/$addressId'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: json.encode(updates),
    );

    final data = json.decode(response.body);

    return {
      'success': response.statusCode == 200,
      'message': data['message'],
      'address': data['address'],
    };
  } catch (e) {
    return {'success': false, 'message': 'Network error: $e'};
  }
}
```

### Delete Address

```dart
// Delete Address
static Future<Map<String, dynamic>> deleteAddress(String addressId) async {
  try {
    final token = await TokenManager.getAccessToken();

    final response = await http.delete(
      Uri.parse('${ApiConstants.addresses}/$addressId'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );

    final data = json.decode(response.body);

    return {
      'success': response.statusCode == 200,
      'message': data['message'],
    };
  } catch (e) {
    return {'success': false, 'message': 'Network error: $e'};
  }
}
```

## 🔄 Token Refresh

```dart
// Refresh Access Token
static Future<bool> refreshAccessToken() async {
  try {
    final refreshToken = await TokenManager.getRefreshToken();

    if (refreshToken == null) return false;

    final response = await http.post(
      Uri.parse(ApiConstants.refreshToken),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({'refreshToken': refreshToken}),
    );

    final data = json.decode(response.body);

    if (response.statusCode == 200) {
      await TokenManager.saveTokens(
        data['token'],
        data['refreshToken'],
      );
      return true;
    } else {
      // Refresh token expired, logout user
      await TokenManager.clearTokens();
      return false;
    }
  } catch (e) {
    return false;
  }
}
```

## ⚠️ Error Handling

### HTTP Interceptor with Auto Token Refresh

```dart
// lib/services/api_client.dart

import 'package:http/http.dart' as http;
import 'dart:convert';

class ApiClient {
  static Future<http.Response> get(String url) async {
    return await _makeRequest(() async {
      final token = await TokenManager.getAccessToken();
      return await http.get(
        Uri.parse(url),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );
    });
  }

  static Future<http.Response> post(String url, Map<String, dynamic> body) async {
    return await _makeRequest(() async {
      final token = await TokenManager.getAccessToken();
      return await http.post(
        Uri.parse(url),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: json.encode(body),
      );
    });
  }

  static Future<http.Response> _makeRequest(
    Future<http.Response> Function() request,
  ) async {
    var response = await request();

    // If token expired (401), try to refresh
    if (response.statusCode == 401) {
      final refreshed = await AuthService.refreshAccessToken();

      if (refreshed) {
        // Retry request with new token
        response = await request();
      } else {
        // Redirect to login
        throw Exception('Session expired. Please login again.');
      }
    }

    return response;
  }
}
```

## 📱 Complete Usage Example

### Registration Screen

```dart
// lib/screens/register_screen.dart

import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

class RegisterScreen extends StatefulWidget {
  @override
  _RegisterScreenState createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  XFile? _profileImage;
  bool _isLoading = false;

  Future<void> _pickImage() async {
    final ImagePicker picker = ImagePicker();
    final XFile? image = await picker.pickImage(source: ImageSource.gallery);
    setState(() {
      _profileImage = image;
    });
  }

  Future<void> _register() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    final result = await AuthService.register(
      name: _nameController.text,
      email: _emailController.text,
      phone: _phoneController.text,
      password: _passwordController.text,
      profileImage: _profileImage,
    );

    setState(() => _isLoading = false);

    if (result['success']) {
      // Navigate to home or show success message
      Navigator.pushReplacementNamed(context, '/home');
    } else {
      // Show error
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(result['message'])),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Register')),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: EdgeInsets.all(16),
          children: [
            // Profile Image
            GestureDetector(
              onTap: _pickImage,
              child: CircleAvatar(
                radius: 50,
                backgroundImage: _profileImage != null
                    ? FileImage(File(_profileImage!.path))
                    : null,
                child: _profileImage == null ? Icon(Icons.add_a_photo) : null,
              ),
            ),
            SizedBox(height: 20),

            // Name
            TextFormField(
              controller: _nameController,
              decoration: InputDecoration(labelText: 'Name'),
              validator: (v) => v!.isEmpty ? 'Required' : null,
            ),

            // Email
            TextFormField(
              controller: _emailController,
              decoration: InputDecoration(labelText: 'Email'),
              keyboardType: TextInputType.emailAddress,
              validator: (v) => v!.isEmpty ? 'Required' : null,
            ),

            // Phone
            TextFormField(
              controller: _phoneController,
              decoration: InputDecoration(labelText: 'Phone'),
              keyboardType: TextInputType.phone,
              validator: (v) => v!.isEmpty ? 'Required' : null,
            ),

            // Password
            TextFormField(
              controller: _passwordController,
              decoration: InputDecoration(labelText: 'Password'),
              obscureText: true,
              validator: (v) => v!.length < 6 ? 'Min 6 characters' : null,
            ),

            SizedBox(height: 20),

            // Register Button
            ElevatedButton(
              onPressed: _isLoading ? null : _register,
              child: _isLoading
                  ? CircularProgressIndicator()
                  : Text('Register'),
            ),
          ],
        ),
      ),
    );
  }
}
```

## 🎯 Best Practices

1. **Always use HTTPS** in production
2. **Store tokens securely** using `flutter_secure_storage` for sensitive data
3. **Implement token refresh** logic to keep users logged in
4. **Handle network errors** gracefully
5. **Show loading indicators** during API calls
6. **Validate inputs** on client side before API calls
7. **Use environment variables** for API URLs
8. **Implement retry logic** for failed requests
9. **Cache data** when appropriate to reduce API calls
10. **Log out users** when refresh token expires

## 📚 Additional Resources

- [Backend API Documentation](./README.md)
- [Dio Package](https://pub.dev/packages/dio) - Advanced HTTP client
- [Flutter Secure Storage](https://pub.dev/packages/flutter_secure_storage) - Secure token storage
- [Provider Package](https://pub.dev/packages/provider) - State management

---

**Need Help?** Check the main [README.md](./README.md) or create an issue on GitHub.
