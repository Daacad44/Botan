from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Custom user model with role-based access."""

    class Roles(models.TextChoices):
        ADMIN = "ADMIN", "Admin"
        TEACHER = "TEACHER", "Teacher"
        STUDENT = "STUDENT", "Student"

    role = models.CharField(
        max_length=20, choices=Roles.choices, default=Roles.STUDENT
    )


class Student(models.Model):
    """Profile information for students."""

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="student"
    )
    date_of_birth = models.DateField(null=True, blank=True)
    enrollment_date = models.DateField(null=True, blank=True)
    profile_photo = models.ImageField(upload_to="profiles/", blank=True, null=True)

    def __str__(self) -> str:
        return f"{self.user.get_full_name()}"


class Course(models.Model):
    """Course offering."""

    course_code = models.CharField(max_length=20, unique=True)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    credits = models.PositiveIntegerField()
    syllabus = models.FileField(upload_to="syllabi/", blank=True, null=True)
    teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        limit_choices_to={"role": User.Roles.TEACHER},
        related_name="courses",
    )

    def __str__(self) -> str:
        return f"{self.course_code} - {self.title}"


class Enrollment(models.Model):
    """Students enrolled in courses."""

    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    enrolled_on = models.DateField(auto_now_add=True)

    class Meta:
        unique_together = ("student", "course")

    def __str__(self) -> str:
        return f"{self.student} -> {self.course}"


class Attendance(models.Model):
    """Attendance record for a student in a course session."""

    PRESENT = "present"
    ABSENT = "absent"
    STATUS_CHOICES = [
        (PRESENT, "Present"),
        (ABSENT, "Absent"),
    ]

    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    date = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES)

    class Meta:
        unique_together = ("student", "course", "date")

    def __str__(self) -> str:
        return f"{self.student} {self.course} {self.date}"


class Grade(models.Model):
    """Grade for a student in a course."""

    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    value = models.DecimalField(max_digits=5, decimal_places=2)
    graded_on = models.DateField(auto_now_add=True)

    class Meta:
        unique_together = ("student", "course")

    def __str__(self) -> str:
        return f"{self.student} - {self.course}: {self.value}"


class Invoice(models.Model):
    """Simple finance invoice for student fees."""

    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=8, decimal_places=2)
    due_date = models.DateField()
    is_paid = models.BooleanField(default=False)

    def __str__(self) -> str:
        return f"Invoice {self.id} for {self.student}"


class Payment(models.Model):
    """Payments made toward invoices."""

    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name="payments")
    amount = models.DecimalField(max_digits=8, decimal_places=2)
    paid_on = models.DateField(auto_now_add=True)

    def __str__(self) -> str:
        return f"Payment {self.amount} on {self.invoice}"
