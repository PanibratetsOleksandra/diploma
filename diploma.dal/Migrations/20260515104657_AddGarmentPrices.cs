using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace diploma.dal.Migrations
{
    /// <inheritdoc />
    public partial class AddGarmentPrices : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "GarmentPrices",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    GarmentType = table.Column<string>(type: "TEXT", nullable: false),
                    BasePrice = table.Column<decimal>(type: "TEXT", nullable: false),
                    LastUpdated = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GarmentPrices", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "GarmentPrices");
        }
    }
}
