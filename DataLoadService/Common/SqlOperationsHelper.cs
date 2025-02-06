using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataLoadService.Common;

internal class SqlOperationsHelper
{
    public static string GetConnectionString()
    {
        return Environment.GetEnvironmentVariable("SqlConnectionString");
    }
    public static async Task<IActionResult> ExecuteSqlAsync(SqlCommand sqlCmd)
    {
        try
        {
            await using (SqlConnection connection = new(GetConnectionString()))
            {
                connection.Open();
                sqlCmd.Connection = connection;
                sqlCmd.ExecuteNonQuery();
            }
            return new StatusCodeResult(StatusCodes.Status200OK);
        }
        catch (Exception e)
        {
            Console.WriteLine(e.Message);
            return new StatusCodeResult(StatusCodes.Status500InternalServerError);
        }
        // Execute the SQL command
    }
}
