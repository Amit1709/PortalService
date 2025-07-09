using DataLoadService.Common;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace DataLoadService
{
    public static class GetCategoryList
    {
        [FunctionName("GetCategoryList")]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Function, "get", "post", Route = null)] HttpRequest req,
            ILogger log)
        {
            log.LogInformation("GetCategoryList List of Categories function processed a request.");
            string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            dynamic data = JsonConvert.DeserializeObject(requestBody);
            int pageNumber = data?.PageNumber;
            int pageSize = data?.PageSize;
            string connectionString = Environment.GetEnvironmentVariable("SqlConnectionString");
            if (string.IsNullOrEmpty(connectionString)) { return new StatusCodeResult(StatusCodes.Status500InternalServerError); }
            List<Category> topics = [];
            try
            {
                await using (SqlConnection connection = new(connectionString))
                {

                    await connection.OpenAsync();
                    string query = "SELECT Id,topicname FROM Topics";
                    await using (SqlCommand command = new(query, connection))
                    {
                        SqlDataReader reader = await command.ExecuteReaderAsync();
                        while (await reader.ReadAsync())
                        {
                            var topic = new Category()
                            {
                                Id = reader.GetInt32(reader.GetOrdinal("Id")),
                                TopicName = reader.GetString(reader.GetOrdinal("topicname")),
                            };
                            topics.Add(topic);
                        }
                    }
                }
                return new OkObjectResult(new PagedViewModel<Category>(topics.AsQueryable(), pageNumber, pageSize));
            }
            catch (Exception ex) { log.LogError($"An error occurred: {ex.Message}"); return new StatusCodeResult(StatusCodes.Status500InternalServerError); }
        }
    }
}
