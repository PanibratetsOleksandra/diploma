using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace diploma.dal.Migrations
{
    /// <inheritdoc />
    public partial class AddUserAddresses : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "UserAddresses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    UserId = table.Column<string>(type: "TEXT", nullable: false),
                    AddressName = table.Column<string>(type: "TEXT", nullable: false),
                    DeliveryService = table.Column<string>(type: "TEXT", nullable: false),
                    DeliveryType = table.Column<string>(type: "TEXT", nullable: false),
                    Region = table.Column<string>(type: "TEXT", nullable: false),
                    City = table.Column<string>(type: "TEXT", nullable: false),
                    WarehouseNumber = table.Column<string>(type: "TEXT", nullable: true),
                    Street = table.Column<string>(type: "TEXT", nullable: true),
                    Building = table.Column<string>(type: "TEXT", nullable: true),
                    Floor = table.Column<string>(type: "TEXT", nullable: true),
                    Apartment = table.Column<string>(type: "TEXT", nullable: true),
                    HasElevator = table.Column<bool>(type: "INTEGER", nullable: false),
                    IsDefault = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserAddresses", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserAddresses");
        }
    }
}
