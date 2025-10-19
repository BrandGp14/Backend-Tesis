import { PartialType } from "@nestjs/mapped-types";
import { UserRoleDto } from "./user-role.dto";

export class UpdateUserRoleDto extends PartialType(UserRoleDto) {}