using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace diploma.dal.Migrations
{
    /// <inheritdoc />
    public partial class AddFrontAndBackToOrderItems : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BackImageUrl",
                table: "OrderItems",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FrontImageUrl",
                table: "OrderItems",
                type: "TEXT",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BackImageUrl",
                table: "OrderItems");

            migrationBuilder.DropColumn(
                name: "FrontImageUrl",
                table: "OrderItems");
        }
    }
}
