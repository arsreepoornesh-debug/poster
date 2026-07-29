import bcrypt from "bcryptjs";
import { UserRepository } from "@/lib/repositories/user.repository";
import { AdminRepository } from "@/lib/repositories/admin.repository";
import { RegisterCustomerDTO, CreateAdminDTO } from "@/lib/dto/auth.dto";

export class AuthService {
  public static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  public static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  public static async registerCustomer(dto: RegisterCustomerDTO) {
    const existing = await UserRepository.findByEmail(dto.email);
    if (existing) {
      throw new Error("Customer with this email already exists");
    }

    const hashedPassword = await this.hashPassword(dto.password);
    const customer = await UserRepository.create({
      ...dto,
      password: hashedPassword,
    });

    return {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
    };
  }

  public static async createAdmin(dto: CreateAdminDTO) {
    const existing = await AdminRepository.findByEmail(dto.email);
    if (existing) {
      throw new Error("Admin account with this email already exists");
    }

    const hashedPassword = await this.hashPassword(dto.password);
    const admin = await AdminRepository.create({
      ...dto,
      password: hashedPassword,
    });

    return {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    };
  }

  public static async requestPasswordReset(email: string) {
    const customer = await UserRepository.findByEmail(email);
    if (!customer) {
      // Return success to avoid email enumeration
      return { success: true, message: "If account exists, reset instructions have been sent." };
    }

    // Generate mock reset token for security flow
    const resetToken = Buffer.from(`${customer.id}:${Date.now()}`).toString("hex");

    return {
      success: true,
      resetToken,
      message: "Password reset instructions issued.",
    };
  }
}
