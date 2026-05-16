"""Admin registrations for core models."""

from django.contrib import admin

from .models import (
    Attendance,
    Course,
    Enrollment,
    Grade,
    Invoice,
    Payment,
    Student,
    User,
)


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("username", "email", "role", "is_staff")


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ("user", "enrollment_date")


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ("course_code", "title", "teacher")


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ("student", "course", "enrolled_on")


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ("student", "course", "date", "status")


@admin.register(Grade)
class GradeAdmin(admin.ModelAdmin):
    list_display = ("student", "course", "value", "graded_on")


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ("student", "amount", "due_date", "is_paid")


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ("invoice", "amount", "paid_on")
