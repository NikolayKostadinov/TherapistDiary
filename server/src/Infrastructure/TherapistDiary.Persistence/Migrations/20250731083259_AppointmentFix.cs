using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TherapistDiary.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AppointmentFix : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Appointment_TherapyTypes_TherapyTypeId",
                table: "Appointment");

            migrationBuilder.RenameColumn(
                name: "TherapyTypeId",
                table: "Appointment",
                newName: "TherapyId");

            migrationBuilder.RenameIndex(
                name: "IX_Appointment_TherapyTypeId",
                table: "Appointment",
                newName: "IX_Appointment_TherapyId");

            migrationBuilder.AddForeignKey(
                name: "FK_Appointment_Therapies_TherapyId",
                table: "Appointment",
                column: "TherapyId",
                principalTable: "Therapies",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Appointment_Therapies_TherapyId",
                table: "Appointment");

            migrationBuilder.RenameColumn(
                name: "TherapyId",
                table: "Appointment",
                newName: "TherapyTypeId");

            migrationBuilder.RenameIndex(
                name: "IX_Appointment_TherapyId",
                table: "Appointment",
                newName: "IX_Appointment_TherapyTypeId");

            migrationBuilder.AddForeignKey(
                name: "FK_Appointment_TherapyTypes_TherapyTypeId",
                table: "Appointment",
                column: "TherapyTypeId",
                principalTable: "TherapyTypes",
                principalColumn: "Id");
        }
    }
}
